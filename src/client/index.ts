/**
 * Browser half of dsh-wsl-workspace. Registers the "Add WSL workspace…"
 * action beside Settings at the sidebar foot (the official
 * `sidebar.footer.action` slot), and keeps every blank session whose
 * workspace is a WSL UNC path composed from the WSL VARIANT of the mode it
 * currently runs (`standard` → `wsl-standard`, PTC → `wsl-code`, …) — so the
 * WSL execution world composes with any mode instead of being a mode itself.
 *
 * The binding is a watching effect rather than a one-shot dialog action so
 * EVERY creation path (this dialog, the workspace row's New Session, the
 * hero picker) converges on the WSL-backed composition automatically.
 */

import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale), the
// runtime's ClientContext, and the ui-sidebar SlotMap merge (the
// 'sidebar.footer.action' entry) into this program.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { check as checkApi, listDir as listDirApi, listDistros as listDistrosApi, listWorkspaces as listWorkspacesApi, registerWindows as registerWindowsApi, setWorkspaceUser as setWorkspaceUserApi } from './api.ts'
import { AddWslWorkspace, type AddWslWorkspaceInjected } from './AddWslWorkspace.tsx'
import { ensureStyles } from './styles.ts'
import { zh, en } from './locales.ts'
import { canonicalWindowsPath, isWslUnc, joinUnc, mntToWindowsPath } from '../shared/paths.ts'

/** Required services (cordis fiber inject). */
export const inject = ['slots', 'locale', 'connection', 'sessions', 'workspaces']

/** The legacy standalone WSL preset id (folded into the mode variants). */
const LEGACY_WSL_PRESET_ID = 'wsl'

/** The WSL mode variant to auto-bind new sessions to. */
const WSL_VARIANT = 'wsl-standard'

/**
 * Minimal sessions-service face. The renderer-host ctx merge types
 * `ctx.sessions` as its own SessionStore; the service the runtime actually
 * registers under that key satisfies this narrower contract, so the cast is
 * the documented boundary for a third-party plugin.
 */
interface WslSessionsFace {
  list: {
    getSnapshot(): { ids: string[]; byId: Record<string, { blank: boolean; cwd?: string; agentPreset?: string }> }
    subscribe(fn: () => void): () => void
  }
  /** Web-only: note the preset locally after a successful select; absent on Desktop. */
  noteAgentPreset?(sessionId: string, agentPreset: string): void
  create(opts: { workspaceId: string }): Promise<string>
  open(sessionId: string): void
}

/** Minimal workspaces-service face (create only). */
interface WslWorkspacesFace {
  create(input: { path: string }): Promise<{ workspaceId: string }>
}

/**
 * Desktop 0.1.x internal SessionManager remote: the typet-based session.create
 * RPC accepts an agentPreset field that the public sessions.create() wrapper
 * does not forward.
 */
interface SessionCreatePayload {
  workspaceId: string
  sessionId?: string
  agentPreset?: string
}

/** Type-et session.create result envelope. */
interface SessionCreateResult {
  ok: boolean
  value?: { sessionId: string; agentPreset?: string }
  error?: { code: string; message: string }
}

/** Internal SessionManager remote face. */
interface SessionManagerRemote {
  session: {
    create(payload: SessionCreatePayload): Promise<SessionCreateResult>
  }
}

/** Internal SessionManager face (accessed via sessions.manager). */
interface SessionManager {
  remote: SessionManagerRemote
  recordMutation(mutation: { kind: string; summary: Record<string, unknown> }): void
}

/** Internal ClientSessions face (the sessions service cast). */
interface ClientSessions {
  manager: SessionManager
  projectList(): void
  list: { getSnapshot(): { ids: string[]; byId: Record<string, unknown> } }
  open(id: string): void
}

/**
 * Mount the sidebar action and the auto-binding effect.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  const connection = ctx.get('connection') as ConnectionHandle & { rpc?: unknown }
  const api = (connection as ConnectionHandle).api
  const workspaces = ctx.get('workspaces') as unknown as WslWorkspacesFace
  const sessions = ctx.get('sessions') as unknown as WslSessionsFace & ClientSessions

  // Desktop 0.1.x: api is absent; use the internal typet remote to create
  // sessions with agentPreset, since the public sessions.create() does not
  // forward the field.
  const hasApi = api !== undefined

  ensureStyles()

  ctx.effect(
    () => ctx.locale.register('wslWorkspace' as never, { zh, en }),
    'dsh-wsl-workspace: locale dictionaries',
  )

  // The injected translate function reads the live DeepSeek Harness locale,
  // so the dialog copy follows the app language setting automatically.
  const t = ctx.locale.bind('wslWorkspace' as never) as unknown as (key: string, params?: Record<string, unknown>) => string

  // Canonical Windows drive keys of every registered `/mnt/<drive>` workspace
  // (refreshed from the host store; see refreshRoster). A blank session whose
  // cwd is one of these binds to the WSL variant like a UNC-cwd session.
  let wslWindowsPaths = new Set<string>()

  /** Create a session in a workspace, passing agentPreset through the internal
   *  typet remote since the public sessions.create() API does not forward it. */
  const createWslSession = async (workspaceId: string): Promise<string> => {
    if (sessions.manager?.remote?.session?.create !== undefined) {
      // Desktop 0.1.x: use the internal typet remote to pass agentPreset.
      const result = await sessions.manager.remote.session.create({
        workspaceId,
        agentPreset: WSL_VARIANT,
      })
      if (result.ok && result.value !== undefined) {
        const sessionId = result.value.sessionId
        // Update the local list snapshot so the UI sees the new session
        // immediately without waiting for the next refresh.
        sessions.manager.recordMutation({
          kind: 'upsert',
          summary: {
            sessionId,
            updatedAt: Date.now(),
            running: false,
            blank: true,
            agentPreset: WSL_VARIANT,
          },
        })
        sessions.projectList()
        return sessionId
      }
    }
    // Fallback: use the public API (Web or Desktop without the internal remote).
    const sessionId = await sessions.create({ workspaceId })
    return sessionId
  }

  const injected = (): AddWslWorkspaceInjected => ({
    t,
    checkPreset: async (): Promise<string | undefined> => {
      if (!hasApi) return undefined
      let roster
      try {
        const response = await api.agentPresets.list({})
        roster = response.result
      } catch (error) {
        return error instanceof Error ? error.message : String(error)
      }
      if (!roster.ok) return roster.error.message
      const healthy = roster.value.presets.find((entry: { id: string; broken?: string }) =>
        entry.id.startsWith('wsl-') && entry.broken === undefined)
      if (healthy === undefined) return t('error.presetMissing')
      return undefined
    },
    listDistros: () => listDistrosApi(),
    listDir: (distro, path) => listDirApi(distro, path),
    check: (distro, path) => checkApi(distro, path),
    createWorkspace: async (linuxPath, username, distro): Promise<string | undefined> => {
      try {
        const winPath = mntToWindowsPath(linuxPath)
        if (winPath !== null) {
          const view = await workspaces.create({ path: winPath })
          await registerWindowsApi(linuxPath, distro, username)
          const canonical = canonicalWindowsPath(winPath)
          if (canonical !== null) wslWindowsPaths = new Set(wslWindowsPaths).add(canonical)
          const sessionId = await createWslSession(view.workspaceId)
          sessions.open(sessionId)
          return undefined
        }
        const uncPath = joinUnc(distro, linuxPath)
        const view = await workspaces.create({ path: uncPath })
        await setWorkspaceUserApi(uncPath, username)
        const sessionId = await createWslSession(view.workspaceId)
        sessions.open(sessionId)
        return undefined
      } catch (error) {
        return error instanceof Error ? error.message : String(error)
      }
    },
  })

  ctx.effect(
    () => ctx.slots.inject(
      'sidebar.footer.action',
      () => ctx.slots.register(
        { name: 'sidebar.footer.action', id: 'wsl-workspace', inject: injected },
        AddWslWorkspace,
      ),
    ),
    'dsh-wsl-workspace: sidebar footer action',
  )

  // ---- Auto-binding effect ----
  // Every blank session whose cwd is a WSL UNC path (or a registered
  // /mnt/<drive> workspace) is bound to the WSL mode variant.  On Web the
  // roster of available variants is refreshed periodically; on Desktop 0.1.x
  // we bind directly to the fixed `wsl-standard` variant via the internal
  // typet remote.
  ctx.effect(() => {
    const inFlight = new Set<string>()
    const attempts = new Map<string, number>()
    const MAX_ATTEMPTS = 3

    // Web path: refresh the roster of available wsl-* variants.
    let variants = new Set<string>()
    let defaultPreset: string | undefined
    const refreshRoster = (): void => {
      if (!hasApi) return
      void api.agentPresets.list({}).then((response: {
        result: { ok: boolean; value: { presets: { id: string; broken?: string; isDefault?: boolean }[] } }
      }) => {
        const result = response.result
        if (!result.ok) return
        variants = new Set(result.value.presets
          .filter((entry: { id: string; broken?: string }) =>
            entry.broken === undefined && entry.id.startsWith('wsl-'))
          .map((entry: { id: string }) => entry.id))
        defaultPreset = result.value.presets.find(
          (entry: { id: string; isDefault?: boolean }) => entry.isDefault === true,
        )?.id
      }).catch(() => { /* stale roster is acceptable */ })
    }
    refreshRoster()

    const refreshWorkspaces = (): void => {
      void listWorkspacesApi().then((keys: string[]) => {
        const next = new Set<string>()
        for (const key of keys) {
          const canonical = canonicalWindowsPath(key)
          if (canonical !== null) next.add(canonical)
        }
        wslWindowsPaths = next
      }).catch(() => { /* stale set is acceptable */ })
    }
    refreshWorkspaces()

    // Bind one session to its WSL variant.  Returns the bound variant id,
    // or undefined when binding is not possible.
    const bindSession = async (id: string): Promise<string | undefined> => {
      const state = sessions.list.getSnapshot()
      const summary = state.byId[id]
      if (summary === undefined || !summary.blank || summary.cwd === undefined) return undefined
      const canonical = canonicalWindowsPath(summary.cwd)
      const isWsl = isWslUnc(summary.cwd)
        || (canonical !== null && wslWindowsPaths.has(canonical))
      if (!isWsl) return undefined
      const current = summary.agentPreset
      if (current !== undefined && current.startsWith('wsl-')) return undefined

      if (hasApi) {
        // Web: resolve the correct variant from the roster.
        const base = current === LEGACY_WSL_PRESET_ID
          ? (defaultPreset ?? 'standard')
          : (current ?? defaultPreset)
        if (base === undefined || base === LEGACY_WSL_PRESET_ID || base.startsWith('wsl-')) return undefined
        const target = `wsl-${base.toLowerCase()}`
        if (!variants.has(target)) return undefined
        inFlight.add(id)
        try {
          const response = await api.agentPresets.select({ sessionId: id, agentPreset: target })
          if (response.result.ok) {
            sessions.noteAgentPreset?.(id, target)
            return target
          }
        } catch { /* retry on next snapshot */ }
        finally { inFlight.delete(id) }
        return undefined
      }

      // Desktop 0.1.x: bind directly to the fixed WSL variant via the
      // internal typet remote (avoids needing the non-existent
      // agentPresets/select HTTP RPC endpoint).  Passing the existing
      // sessionId to session.create applies the agentPreset on the host.
      if (sessions.manager?.remote?.session?.create === undefined) return undefined
      inFlight.add(id)
      try {
        await sessions.manager.remote.session.create({
          workspaceId: '',
          sessionId: id,
          agentPreset: WSL_VARIANT,
        } as unknown as SessionCreatePayload)
        return WSL_VARIANT
      } catch { /* retry on next snapshot */ }
      finally { inFlight.delete(id) }
      return undefined
    }

    const maybeBind = (): void => {
      const state = sessions.list.getSnapshot()
      for (const id of state.ids) {
        if (inFlight.has(id) || (attempts.get(id) ?? 0) >= MAX_ATTEMPTS) continue
        void bindSession(id).then((bound) => {
          if (bound === undefined) attempts.set(id, (attempts.get(id) ?? 0) + 1)
        })
      }
    }
    maybeBind()
    const unsubscribe = sessions.list.subscribe(() => maybeBind())
    const timer = window.setInterval(refreshRoster, 60_000)
    return () => {
      unsubscribe()
      window.clearInterval(timer)
    }
  }, 'dsh-wsl-workspace: WSL mode-variant binding')
}
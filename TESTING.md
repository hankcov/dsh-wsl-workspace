# Testing

This document describes how to verify `dsh-wsl-workspace` after a change or before a release. The suite covers unit tests, the preset-materialization integration test, a real-WSL smoke test, and a post-build lib verification gate.

## Prerequisites

- Windows host with WSL2 and at least one distribution installed (`wsl.exe` on `PATH`).
- Node.js 24+ (the tests run with Node's built-in TypeScript support; `tsx` is not required).
- The DeepSeek Harness checkout (for `tsc`/`tsdown` and the `@deepseek-ai/*` type declarations the `tsconfig.json` paths point at).

## Unit tests

Run the unit tests from the plugin directory:

```powershell
node --experimental-strip-types --test tests/variants.test.ts tests/fs-execution-context.test.ts tests/shell.test.ts tests/paths.test.ts
```

Coverage:

| File | What it verifies |
|---|---|
| `tests/variants.test.ts` | The WSL preset-variant transform: world rows are dropped, the WSL realm is injected, `str-replace-editor` is re-injected exactly once (and only when the source references it), prefab-family rows (`custom-bash`, `bootstrap-filesystem`) are removed, unknown rows are preserved verbatim. |
| `tests/fs-execution-context.test.ts` | `WslFileSystem` inherits the calling session's cwd through `AsyncLocalStorage` on `tools/execute`; agentless calls fall back to the configured distro. |
| `tests/shell.test.ts` | The login-shell `cd` prefix preserves the resolved workdir (including single-quote escaping); non-login shells leave the command unchanged. |
| `tests/paths.test.ts` | UNC ↔ Linux path translation, `/mnt/<drive>` mapping, canonical Windows path keys, WSL username validation. |

## Preset materialization integration test

Boots the host plugin's `apply()` against a fake context with `DSH_HOME` pointed at a temp directory, then asserts the generated variant rows reference real built lib files and the composition carries the WSL execution-world realm:

```powershell
node tests/host-materialize.mjs
```

This covers variant generation, opaque source-directory mirroring (third-party assets travel with the variant), atomic publication (a failed regeneration preserves the previous complete variant), stale-variant cleanup, and legacy `wsl` preset removal.

## Real-WSL smoke test

Requires a running WSL distribution (the first listed distro is used; infrastructure distros such as `docker-desktop` are skipped):

```powershell
node --experimental-strip-types tests/smoke.ts
```

This exercises the filesystem round-trip (resolve/write/read/edit/stat/version/listDir/contains/fileUrl), bash execution inside WSL (cwd translation, WSLENV pass-through, stdin, background jobs), Linux-workdir resolution through the session distro fact, `/mnt/<drive>` dual access, and the no-config default-distro fallback.

## Post-build lib verification

`scripts/verify-lib.mjs` parses every `lib/*.js` entry and fails the build when a bare call to a Node builtin export has no matching `node:*` import. This catches the class of bug where a symbol is used but never imported (for example `statSync` in 0.2.3, which made the Add-WSL-Workspace dialog report every path as non-existent at runtime):

```powershell
node scripts/verify-lib.mjs
```

The `build` script chains it after `tsdown`:

```powershell
pnpm build   # tsdown && node scripts/verify-lib.mjs
```

## End-to-end verification in the running harness

After installing the plugin into a profile and restarting `dsh web`:

1. The **W** button appears beside Settings at the sidebar foot.
2. Open "Add WSL workspace…", browse to a directory (e.g. `/home`), and click "Create & open" — the workspace must be created without a "path does not exist" error.
3. In the new session, the mode picker shows the WSL variant (e.g. `WSL · Standard mode（标准模式）`); the bash tool runs inside the distribution (`pwd` returns a Linux path, `uname -s` returns `Linux`).
4. `read`/`write`/`edit` operate on WSL files; Windows files stay reachable under `/mnt/<drive>`.
5. Switch modes (Standard / PTC / Minimal / Creative) — each lands on its WSL variant and the tool catalog matches the mode.
6. The plugin API responds correctly: `POST /wsl-workspace/api` with `{"method":"check","params":{"distro":"<distro>","path":"/home"}}` returns `{"ok":true,"value":{"exists":true,"isDirectory":true}}`.

## Release checklist

1. `pnpm build` — rebuilds `lib/` and runs the verification gate.
2. `node --experimental-strip-types --test tests/variants.test.ts tests/fs-execution-context.test.ts tests/shell.test.ts tests/paths.test.ts` — all green.
3. `node tests/host-materialize.mjs` — all assertions pass.
4. `node --experimental-strip-types tests/smoke.ts` — real-WSL round-trip passes.
5. `npm pack --dry-run` — confirm the tarball carries only live `lib/` chunks, `src/`, `cordis.patch.yml`, READMEs, `LICENSE`, and `NOTICE`.
6. Install the tarball into a clean profile (`dsh plugin --profile web add <tarball>`), restart `dsh web`, and run the end-to-end checks above.
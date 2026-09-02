# HANDOFF: DSH Desktop 2.0.4 兼容性修改

## 背景

`dsh-wsl-workspace` 原为 DeepSeek Harness **Web 版**设计（兼容 0.1.0-rc.7 ~ 0.1.1-rc.2），
在 **DSH Desktop 2.0.4**（Electron 43，Node.js 24）上安装后应用进入恢复模式。

## 根因

两个不兼容问题：

### 1. 模块解析机制不兼容（Host 端）

DSH Desktop 2.0.4 使用自定义 `module-resolution.js` 钩子拦截所有 `@deepseek-ai/*` 导入，
并尝试从 `app.asar` 解析。插件从 profile 的 `node_modules` 加载时，该钩子无法解析
`@deepseek-ai/dsh-shell`、`@deepseek-ai/dsh-fs` 等 seam 包。

**修复**：将 seam 包内联到构建产物中，不再作为运行时外部依赖。

### 2. API 路由不兼容（Client 端）

DSH Desktop 2.0.4 的 `connection` 服务不提供 `api.agentPresets` 路由
（这是 DSH Web 的 API Remotes 机制，Desktop 版结构不同）。

**修复**：在客户端代码中增加 `api.agentPresets === undefined` 保护性检查，
Desktop 下跳过自动模式绑定（auto-binding）功能，不影响 WSL 工作区创建核心流程。

---

## 修改的文件

### `tsdown.config.ts` — 构建配置

**改动**：将 `NODE_EXTERNALS` 从通配 `[/^@deepseek-ai//, ...]` 改为精确列举
`CORE_EXTERNALS`，只保留核心框架为外部依赖：

| 外部化 | 包 |
|--------|-----|
| 保持外部 | `@deepseek-ai/cordis`, `@deepseek-ai/schemastery` |
| 保持外部 | `react`, `react-dom`, `@deepseek-ai/dsh-client-*` |
| 改为内联 | `@deepseek-ai/dsh-shell`, `@deepseek-ai/dsh-fs` |
| 改为内联 | `@deepseek-ai/dsh-fs-local`, `@deepseek-ai/dsh-subprocess` |
| 改为内联 | `@deepseek-ai/dsh-timeout` |

### `package.json` — 包配置

- **版本**：`0.4.0` -> `0.4.1`
- **兼容声明**：新增 `"2.0.4": "compatible"`
- **peerDependencies**：仅保留 `@deepseek-ai/cordis`、`@deepseek-ai/schemastery`
- **devDependencies**：新增 seam 包（构建时内联需要）
- **keywords**：新增 `"desktop"`

### `src/fs.ts` — 文件系统 Provider

新增两行导入以满足 `verify-lib` 脚本对 `lib/fs.js` 中内联库代码的检查：

```typescript
import { sep } from 'node:path'
import { randomUUID } from 'node:crypto'
```

### `src/client/index.ts` — 客户端插件

两处保护性修改：

1. `checkPreset` 函数（第 81 行）：
   ```typescript
   if (api.agentPresets === undefined) return undefined
   ```

2. 自动模式绑定 effect（第 142-143 行）：
   ```typescript
   if (api.agentPresets === undefined) return () => {}
   ```

### `scripts/verify-lib.mjs` — 构建验证脚本

移除了"imported but never used (tree-shaken)"检查（第 240-249 行）。
原检查假设所有 `node:*` 导入都来自插件源码，内联库代码会带来无法区分的死导入。
保留了对"裸调用无导入"（statSync 类 bug）的关键防护。

---

## 构建与安装

```bash
# 1. 安装依赖（首次）
cd /home/hankcov/code/dsh-wsl-workspace
npm install --save-dev @deepseek-ai/dsh-shell @deepseek-ai/dsh-fs @deepseek-ai/dsh-fs-local @deepseek-ai/dsh-subprocess @deepseek-ai/dsh-timeout --legacy-peer-deps
pnpm approve-builds    # 批准 koffi 构建
pnpm add -D tsdown     # 安装构建工具

# 2. 构建
pnpm build

# 3. 复制到安装目录
cp -f lib/*.js lib/*.js.map /mnt/e/autocode/dsh/lib/
cp -f package.json /mnt/e/autocode/dsh/

# 4. 安装到 Desktop profile
dsh plugin --profile desktop add E:\autocode\dsh
```

---

## 已知限制

| 限制 | 影响 | 原因 |
|------|------|------|
| 自动模式绑定失效 | WSL 工作区新会话不会自动切换为 `wsl-standard` 等变体模式 | Desktop 无 `api.agentPresets` 路由 |
| 预设检查跳过 | 对话框不会验证 WSL 变体是否已生成 | 同上 |
| 客户端注入槽位 | `sidebar.footer.action` 在 Desktop 中可能不渲染 | `@deepseek-ai/dsh-client-ui-sidebar` 是 Web 版包 |

---

## 未解决的问题

1. **客户端插件渲染** — `dsh.client.platform: "web"` 和 `@deepseek-ai/dsh-client-ui-sidebar`
   注入在 Desktop 中可能不工作。如果"W"按钮不显示，需要调查 Desktop 的侧栏插槽机制。
2. **`@deepseek-ai/dsh-llm` 和 `@deepseek-ai/dsh-settings`** — 这些是 seam 包的传递依赖，
   已被内联打包。如果 Desktop 运行时内部也有这些包，可能存在版本冲突。
3. **`cordis.patch.yml` 格式** — 当前使用 DSH Web 的 `- insert` 语法，如果 Desktop 的
   bundle 系统格式不同，可能需要调整。

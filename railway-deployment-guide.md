# Railway 部署完整指南

> 臺中榮總放射腫瘤科劑量室工作分配系統 - 部署踩坑紀錄

---

## 目錄

1. [專案結構](#專案結構)
2. [錯誤 1：Nixpacks 無法偵測專案](#錯誤-1nixpacks-無法偵測專案)
3. [錯誤 2：npm 套件未定義](#錯誤-2npm-套件未定義)
4. [錯誤 3：vite 找不到](#錯誤-3vite-找不到)
5. [錯誤 4：useAuth import 錯誤](#錯誤-4useauth-import-錯誤)
6. [錯誤 5：資料表不存在](#錯誤-5資料表不存在)
7. [錯誤 6：Build 階段無法連線資料庫](#錯誤-6build-階段無法連線資料庫)
8. [最終正確設定](#最終正確設定)
9. [部署檢查清單](#部署檢查清單)

---

## 專案結構

```
tcvgh-sela-workload/
├── package.json          # 根目錄 (讓 Railway 偵測)
├── nixpacks.toml         # Nixpacks 建置設定
├── railway.json          # Railway 部署設定
├── server/               # 後端 Express
│   ├── package.json
│   └── src/
└── client/               # 前端 React + Vite
    ├── package.json
    └── src/
```

---

## 錯誤 1：Nixpacks 無法偵測專案

### 錯誤訊息
```
Failed to generate build plan
```

### 原因
根目錄沒有 `package.json`，Nixpacks 無法辨識專案類型。

### 解決方案

**建立根目錄 package.json：**
```json
{
  "name": "tcvgh-sela-workload",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "cd client && npm run build",
    "start": "cd server && npm start"
  }
}
```

**建立 nixpacks.toml：**
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = [
  "cd server && npm install",
  "cd client && npm install"
]

[phases.build]
cmds = [
  "cd client && npm run build"
]

[start]
cmd = "cd server && npm start"
```

---

## 錯誤 2：npm 套件未定義

### 錯誤訊息
```
error: undefined variable 'npm'
```

### 原因
`nixpacks.toml` 中寫了 `nixPkgs = ["nodejs_20", "npm"]`，但 npm 已經內建在 nodejs_20 裡面。

### 解決方案

**移除 npm，只保留 nodejs_20：**
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]
```

---

## 錯誤 3：vite 找不到

### 錯誤訊息
```
sh: 1: vite: not found
```

### 原因
1. `vite` 在 `devDependencies`，production 環境不安裝
2. 即使安裝了，也不在 PATH 中

### 解決方案

**1. 將 vite 相關套件移到 dependencies：**

修改 `client/package.json`：
```json
{
  "dependencies": {
    "vite": "^5.0.8",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

**2. 使用 npx 執行 vite：**
```json
{
  "scripts": {
    "build": "npx vite build"
  }
}
```

---

## 錯誤 4：useAuth import 錯誤

### 錯誤訊息
```
"useAuth" is not exported by "src/context/AuthContext.jsx"
```

### 原因
多個檔案從錯誤的路徑 import `useAuth`。

### 解決方案

**修正 import 路徑：**
```javascript
// ❌ 錯誤
import { useAuth } from '../../context/AuthContext';

// ✅ 正確
import { useAuth } from '../../hooks/useAuth';
```

**需修正的檔案：**
- `client/src/components/layout/Sidebar.jsx`
- `client/src/components/layout/Navbar.jsx`
- `client/src/pages/DashboardPage.jsx`
- `client/src/pages/auth/LoginPage.jsx`
- `client/src/pages/auth/ChangePasswordPage.jsx`

---

## 錯誤 5：資料表不存在

### 錯誤訊息
```
error: relation "users" does not exist
code: '42P01'
```

### 原因
伺服器已成功啟動，但資料庫還沒有執行 migration 建立資料表。

### 解決方案
需要執行 `npm run db:migrate` 和 `npm run db:seed`。

但這裡遇到另一個問題 👇

---

## 錯誤 6：Build 階段無法連線資料庫

### 錯誤訊息
```
getaddrinfo ENOTFOUND postgres.railway.internal
```

### 原因
把 `db:migrate` 放在 nixpacks.toml 的 build 階段執行，但 `postgres.railway.internal` 這個內部 DNS 只有在 **runtime（啟動階段）** 才能解析。

**❌ 錯誤做法：**
```toml
[phases.build]
cmds = [
  "cd client && npm run build",
  "cd server && npm run db:migrate"  # 這裡連不到資料庫！
]
```

### 解決方案

**使用 railway.json 的 startCommand：**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd server && npm run db:migrate && npm run db:seed && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**關鍵點：** `startCommand` 會覆蓋 nixpacks.toml 的 `[start]` 設定，在 runtime 執行，此時可以連線到資料庫。

---

## 最終正確設定

### railway.json（首次部署，含 migrate）
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd server && npm run db:migrate && npm run db:seed && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### railway.json（正常運行，不含 migrate）
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### nixpacks.toml（固定不變）
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = [
  "cd server && npm install",
  "cd client && npm install"
]

[phases.build]
cmds = [
  "cd client && npm run build"
]

[start]
cmd = "cd server && npm start"
```

### 根目錄 package.json
```json
{
  "name": "tcvgh-sela-workload",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "cd client && npm run build",
    "start": "cd server && npm start"
  }
}
```

### client/package.json（關鍵部分）
```json
{
  "scripts": {
    "build": "npx vite build"
  },
  "dependencies": {
    "vite": "^5.0.8",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

---

## 部署檢查清單

### 首次部署
- [ ] 根目錄有 `package.json`
- [ ] 根目錄有 `nixpacks.toml`
- [ ] 根目錄有 `railway.json`
- [ ] `railway.json` 的 `startCommand` 包含 `db:migrate` 和 `db:seed`
- [ ] `client/package.json` 中 vite 在 dependencies
- [ ] `client/package.json` 的 build script 使用 `npx vite build`
- [ ] 所有 `useAuth` import 路徑正確
- [ ] Railway 環境變數已設定（DATABASE_URL, JWT_SECRET）

### 部署成功後
- [ ] 移除 `railway.json` 中的 `db:migrate` 和 `db:seed`
- [ ] 重新 push 一次

### 後續新增 Migration
當需要執行新的 migration 時：
1. 暫時把 `railway.json` 的 `startCommand` 加回 `db:migrate`
2. Push 部署
3. 成功後改回來

---

## 常用指令

```bash
# 本地測試
cd server && npm run db:migrate
cd server && npm run db:seed
cd server && npm start

# Git 部署
git add .
git commit -m "fix: deployment"
git push

# 查看 Railway 日誌
# 在 Railway Dashboard > Service > Deployments > View Logs
```

---

## 重點摘要

| 問題 | 原因 | 解法 |
|------|------|------|
| 無法偵測專案 | 缺少根目錄 package.json | 建立根目錄 package.json + nixpacks.toml |
| npm 未定義 | npm 已內建於 nodejs | nixPkgs 只寫 nodejs_20 |
| vite 找不到 | devDeps 不安裝 + 不在 PATH | 移到 deps + 用 npx |
| import 錯誤 | 路徑錯誤 | 修正 import 路徑 |
| 資料表不存在 | 沒執行 migrate | 執行 db:migrate |
| Build 時連不到 DB | 內部 DNS 只在 runtime 有效 | 用 railway.json startCommand |

---

*最後更新：2026-01-07*

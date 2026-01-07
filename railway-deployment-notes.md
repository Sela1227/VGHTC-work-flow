# Railway 部署筆記

## 部署錯誤總結

### 1. Nixpacks 無法產生建置計畫

**錯誤訊息：**
```
Nixpacks was unable to generate a build plan for this app.
```

**原因：** 根目錄沒有 `package.json`，Railway 無法偵測專案類型

**解法：** 在根目錄建立 `package.json`
```json
{
  "name": "your-project",
  "version": "1.0.0",
  "scripts": {
    "build": "cd client && npm install && npm run build",
    "start": "cd server && npm start"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

### 2. npm 未定義變數錯誤

**錯誤訊息：**
```
error: undefined variable 'npm'
```

**原因：** `nixpacks.toml` 中 `npm` 不是獨立的 Nix 套件，它已內建於 `nodejs`

**解法：** 只寫 `nodejs_20`
```toml
# ❌ 錯誤
[phases.setup]
nixPkgs = ["nodejs_20", "npm"]

# ✅ 正確
[phases.setup]
nixPkgs = ["nodejs_20"]
```

---

### 3. vite 找不到

**錯誤訊息：**
```
sh: 1: vite: not found
```

**原因：** 
1. `vite` 放在 `devDependencies`，production 環境不安裝
2. 即使安裝了，執行路徑也不在 PATH 中

**解法：**
1. 把 `vite` 和 `@vitejs/plugin-react` 移到 `dependencies`
2. 使用 `npx` 執行

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

### 4. 模組 export 錯誤

**錯誤訊息：**
```
"useAuth" is not exported by "src/context/AuthContext.jsx"
```

**原因：** import 路徑錯誤，從錯誤的檔案 import

**解法：** 確認 import 路徑正確
```javascript
// ❌ 錯誤
import { useAuth } from '../../context/AuthContext';

// ✅ 正確 (如果 useAuth 在 hooks 資料夾)
import { useAuth } from '../../hooks/useAuth';
```

---

## 正確的設定檔範本

### nixpacks.toml
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

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd server && npm install && cd ../client && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 根目錄 package.json
```json
{
  "name": "your-project",
  "version": "1.0.0",
  "scripts": {
    "build": "cd client && npm install && npm run build",
    "start": "cd server && npm start",
    "postinstall": "npm run build"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### client/package.json (重點部分)
```json
{
  "scripts": {
    "dev": "npx vite",
    "build": "npx vite build",
    "preview": "npx vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "vite": "^5.0.8",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

---

## 部署後檢查清單

- [ ] 根目錄有 `package.json`
- [ ] `nixpacks.toml` 中 nodejs 不重複加 npm
- [ ] `vite` 相關套件在 `dependencies`
- [ ] 所有 import 路徑正確
- [ ] 環境變數已設定 (DATABASE_URL, JWT_SECRET)
- [ ] 資料庫遷移已執行

---

## 常用指令

```bash
# 資料庫遷移
cd server && npm run db:migrate

# 填入種子資料
cd server && npm run db:seed

# 重置資料庫
cd server && npm run db:reset
```

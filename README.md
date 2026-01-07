# 臺中榮總放射腫瘤科劑量室工作分配系統

## 快速開始

### 環境需求
- Node.js 20+
- PostgreSQL 15+

### 安裝
```bash
cd server && npm install
cp .env.example .env
npm run db:migrate
npm run db:seed

cd ../client && npm install
```

### 啟動
```bash
cd server && npm run dev
cd client && npm run dev
```

### 預設帳號
| 角色 | 帳號 | 密碼 |
|------|------|------|
| 超級管理者 | Sela | 6812 |
| 管理者 | 00 | 1111 |
| 同仁 | 1-12 | 0000 |

> ⚠️ 首次登入請修改密碼

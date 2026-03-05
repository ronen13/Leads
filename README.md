# GrantFlow 🎯
מערכת לאיסוף לידים מרואי חשבון ועורכי דין לצורך קבלת מענקים.

---

## 🏗 מבנה הפרויקט

```
grantflow/
├── client/          ← React frontend
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── api.js
│       └── pages/
│           ├── LeadForm.js         ← טופס לקוח
│           ├── AdvisorDashboard.js ← דאשבורד יועץ
│           └── AdminPanel.js       ← פאנל ניהול
├── server/
│   ├── index.js     ← Express + SQLite API
│   └── package.json
├── render.yaml      ← Render deployment config
└── package.json     ← Root build scripts
```

---

## 🌐 ניתוב (URL Routing)

| כתובת | מה מוצג |
|-------|---------|
| `/` | פאנל ניהול (Admin) |
| `/?advisor=CODE` | טופס לקוח – ממולץ ליועץ ספציפי |
| `/?dashboard=CODE` | דאשבורד יועץ – צפייה בלקוחות שלו |

---

## 🚀 פריסה ל-Render (שלב אחר שלב)

### 1. העלה ל-GitHub
```bash
cd grantflow
git init
git add .
git commit -m "Initial commit – GrantFlow"
git remote add origin https://github.com/YOUR_USERNAME/grantflow.git
git push -u origin main
```

### 2. צור שירות ב-Render
1. לך ל-[render.com](https://render.com) → **New → Web Service**
2. חבר את ה-GitHub repo שלך
3. הגדרות:
   - **Name:** `grantflow`
   - **Environment:** `Node`
   - **Build Command:**
     ```
     cd client && npm install && npm run build && cd ../server && npm install
     ```
   - **Start Command:**
     ```
     cd server && node index.js
     ```
   - **Plan:** Free

### 3. הוסף Disk (לשמירת DB)
1. בהגדרות השירות → **Disks** → **Add Disk**
2. **Name:** `grantflow-db`
3. **Mount Path:** `/opt/render/project/src/server`
4. **Size:** 1 GB

### 4. הגדר Environment Variables
```
NODE_ENV = production
PORT     = 3001
```

### 5. Deploy!
לחץ **Deploy** וחכה 3-5 דקות.

---

## 📡 API Endpoints

| Method | Path | תיאור |
|--------|------|-------|
| GET | `/api/advisors` | כל היועצים |
| GET | `/api/advisors/:code` | יועץ לפי קוד |
| POST | `/api/advisors` | יצירת יועץ חדש |
| DELETE | `/api/advisors/:code` | מחיקת יועץ |
| GET | `/api/leads` | כל הלידים |
| GET | `/api/leads/by-advisor/:code` | לידים של יועץ |
| POST | `/api/leads` | שמירת ליד חדש |
| PATCH | `/api/leads/:id/status` | עדכון סטטוס |
| GET | `/api/grants` | מאגר מענקים |

---

## 💻 פיתוח מקומי

```bash
# Terminal 1 – Backend
cd server
npm install
node index.js    # runs on :3001

# Terminal 2 – Frontend
cd client
npm install
npm start        # runs on :3000 (proxies API to :3001)
```

---

## 🔧 טכנולוגיות
- **Frontend:** React 18
- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3)
- **Hosting:** Render.com

# GrantFlow 🎯

מערכת לאיסוף לידים מרואי חשבון ועורכי דין לצורך קבלת מענקים.

---

## 🏗 מבנה הפרויקט (שטוח)

```
grantflow/
├── index.js             ← Express server (כאן, בroot!)
├── package.json         ← dependencies כולל better-sqlite3
├── render.yaml
├── .node-version        ← מכריח Node 22
├── client/
│   ├── package.json
│   ├── public/index.html
│   └── src/
│       ├── App.js
│       ├── api.js
│       ├── index.js
│       └── pages/
│           ├── LeadForm.js
│           ├── AdvisorDashboard.js
│           └── AdminPanel.js
```

---

## 🚀 פריסה ל-Render

### 1. העלה ל-GitHub
```bash
git init
git add .
git commit -m "GrantFlow"
git remote add origin https://github.com/YOUR_USER/grantflow.git
git push -u origin main
```

### 2. צור Web Service ב-Render
- [render.com](https://render.com) → **New → Web Service**
- חבר את ה-repo

### 3. הגדרות חשובות ב-Render Dashboard

| שדה | ערך |
|-----|-----|
| **Environment** | `Node` |
| **Build Command** | `npm install && cd client && npm install && npm run build` |
| **Start Command** | `node index.js` |

### ⚠️ חשוב: הגדר Node 22 ידנית!
ב-Render Dashboard:
1. לך ל-**Environment** → **Environment Variables**
2. הוסף: `NODE_VERSION` = `22.14.0`

(Render מתעלם מ-.node-version לפעמים, אז חובה להוסיף את המשתנה ידנית)

### 4. הוסף Disk (לשמירת SQLite DB)
- **Disks → Add Disk**
- **Name:** `grantflow-db`
- **Mount Path:** `/opt/render/project/src`
- **Size:** 1 GB

---

## 🌐 ניתוב

| כתובת | תיאור |
|-------|-------|
| `/` | פאנל ניהול |
| `/?advisor=CODE` | טופס לקוח |
| `/?dashboard=CODE` | דאשבורד יועץ |

---

## 💻 פיתוח מקומי

```bash
# התקן dependencies
npm install
cd client && npm install && cd ..

# הרץ React dev server (port 3000)
cd client && npm start

# בטרמינל נפרד – הרץ שרת API (port 3001)
node index.js
```

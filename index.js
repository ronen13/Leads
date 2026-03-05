const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── DB Setup ─────────────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, "grantflow.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS advisors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('cpa','lawyer')),
    email TEXT,
    code TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    advisor_code TEXT NOT NULL,
    advisor_name TEXT,
    business_name TEXT,
    owner_name TEXT,
    phone TEXT,
    email TEXT,
    business_type TEXT,
    sector TEXT,
    employees INTEGER,
    annual_revenue TEXT,
    years_active INTEGER,
    has_rnd TEXT,
    is_exporter TEXT,
    region TEXT,
    challenges TEXT,
    additional_info TEXT,
    status TEXT DEFAULT 'new',
    matched_grants TEXT DEFAULT '[]',
    submitted_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed default advisors if empty
const count = db.prepare("SELECT COUNT(*) as c FROM advisors").get();
if (count.c === 0) {
  const insert = db.prepare("INSERT INTO advisors (id,name,type,email,code) VALUES (?,?,?,?,?)");
  insert.run("adv-001-cpa", 'רו"ח דוד לוי', "cpa", "david@example.com", "adv-001-cpa");
  insert.run("adv-002-law", 'עו"ד מיכל כהן', "lawyer", "michal@example.com", "adv-002-law");
  insert.run("adv-003-cpa", 'רו"ח שרה ברק', "cpa", "sara@example.com", "adv-003-cpa");
}

// ─── Grant Matching ───────────────────────────────────────────────────────────
const GRANTS = [
  { id: 1, name: "מענק חדשנות טכנולוגית", minRevenue: 0, maxRevenue: 50000000, sectors: ["טכנולוגיה","תוכנה","סייבר","בינה מלאכותית"], minEmployees: 1, maxEmployees: 250, amount: "עד ₪500,000", matchScore: 95 },
  { id: 2, name: "מענק יצוא לעסקים קטנים", minRevenue: 500000, maxRevenue: 20000000, sectors: ["יצוא","ייצור","מסחר"], minEmployees: 5, maxEmployees: 100, amount: "עד ₪300,000", matchScore: 88 },
  { id: 3, name: "מענק העסקת עובדים", minRevenue: 0, maxRevenue: 100000000, sectors: ["כל הסקטורים"], minEmployees: 10, maxEmployees: 1000, amount: "עד ₪150,000", matchScore: 75 },
  { id: 4, name: "מענק ירוק – אנרגיה מתחדשת", minRevenue: 0, maxRevenue: 200000000, sectors: ["אנרגיה","ייצור","חקלאות","בנייה"], minEmployees: 1, maxEmployees: 500, amount: "עד ₪800,000", matchScore: 90 },
  { id: 5, name: "מענק קורונה – שיקום עסקים", minRevenue: 0, maxRevenue: 30000000, sectors: ["כל הסקטורים"], minEmployees: 1, maxEmployees: 200, amount: "עד ₪200,000", matchScore: 70 },
  { id: 6, name: "מסלול מחקר ופיתוח – רשות החדשנות", minRevenue: 0, maxRevenue: 500000000, sectors: ["טכנולוגיה","רפואה","חקלאות","תוכנה","ביומד"], minEmployees: 3, maxEmployees: 1000, amount: "עד ₪2,000,000", matchScore: 92 },
  { id: 7, name: "מענק פיתוח אזורי", minRevenue: 0, maxRevenue: 50000000, sectors: ["כל הסקטורים"], minEmployees: 2, maxEmployees: 300, amount: "עד ₪600,000", matchScore: 82 },
];

function matchGrants(data) {
  const revenue = parseInt(String(data.annual_revenue || "0").replace(/[^0-9]/g, "") || "0");
  const employees = parseInt(data.employees || "0");
  const sector = data.sector || "";
  return GRANTS.filter(g => {
    const revMatch = revenue === 0 || (revenue >= g.minRevenue && revenue <= g.maxRevenue);
    const empMatch = employees === 0 || (employees >= g.minEmployees && employees <= g.maxEmployees);
    const secMatch = g.sectors.includes("כל הסקטורים") || g.sectors.some(s => sector.includes(s) || s.includes(sector));
    return revMatch && empMatch && secMatch;
  }).sort((a, b) => b.matchScore - a.matchScore);
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve React build in production
app.use(express.static(path.join(__dirname, "client/build")));

// ─── API Routes ───────────────────────────────────────────────────────────────

// GET /api/advisors
app.get("/api/advisors", (req, res) => {
  const rows = db.prepare("SELECT * FROM advisors ORDER BY created_at DESC").all();
  res.json(rows);
});

// GET /api/advisors/:code
app.get("/api/advisors/:code", (req, res) => {
  const row = db.prepare("SELECT * FROM advisors WHERE code = ?").get(req.params.code);
  if (!row) return res.status(404).json({ error: "Advisor not found" });
  res.json(row);
});

// POST /api/advisors
app.post("/api/advisors", (req, res) => {
  const { name, type, email } = req.body;
  if (!name || !type) return res.status(400).json({ error: "name and type required" });
  const id = "adv-" + Date.now() + "-" + type.slice(0, 3);
  db.prepare("INSERT INTO advisors (id,name,type,email,code) VALUES (?,?,?,?,?)").run(id, name, type, email || "", id);
  res.json({ id, name, type, email, code: id });
});

// DELETE /api/advisors/:code
app.delete("/api/advisors/:code", (req, res) => {
  db.prepare("DELETE FROM advisors WHERE code = ?").run(req.params.code);
  res.json({ ok: true });
});

// GET /api/leads
app.get("/api/leads", (req, res) => {
  const rows = db.prepare("SELECT * FROM leads ORDER BY submitted_at DESC").all();
  res.json(rows.map(r => ({ ...r, matched_grants: JSON.parse(r.matched_grants || "[]") })));
});

// GET /api/leads/by-advisor/:code
app.get("/api/leads/by-advisor/:code", (req, res) => {
  const rows = db.prepare("SELECT * FROM leads WHERE advisor_code = ? ORDER BY submitted_at DESC").all(req.params.code);
  res.json(rows.map(r => ({ ...r, matched_grants: JSON.parse(r.matched_grants || "[]") })));
});

// POST /api/leads
app.post("/api/leads", (req, res) => {
  const data = req.body;
  const advisor = db.prepare("SELECT * FROM advisors WHERE code = ?").get(data.advisorCode);
  if (!advisor) return res.status(404).json({ error: "Advisor not found" });

  const id = "lead-" + uuidv4();
  const matched = matchGrants({
    annual_revenue: data.annualRevenue,
    employees: data.employees,
    sector: data.sector,
  });

  db.prepare(`
    INSERT INTO leads (
      id, advisor_code, advisor_name, business_name, owner_name, phone, email,
      business_type, sector, employees, annual_revenue, years_active,
      has_rnd, is_exporter, region, challenges, additional_info, matched_grants
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id, data.advisorCode, advisor.name, data.businessName, data.ownerName,
    data.phone, data.email, data.businessType, data.sector,
    parseInt(data.employees) || 0, data.annualRevenue,
    parseInt(data.yearsActive) || 0, data.hasRnd, data.isExporter,
    data.region, data.challenges, data.additionalInfo,
    JSON.stringify(matched)
  );

  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(id);
  res.json({ ...lead, matched_grants: matched });
});

// PATCH /api/leads/:id/status
app.patch("/api/leads/:id/status", (req, res) => {
  const { status } = req.body;
  const allowed = ["new", "reviewing", "approved", "rejected"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
  db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ ok: true });
});

// GET /api/grants
app.get("/api/grants", (req, res) => {
  res.json(GRANTS);
});

// Catch-all → React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(PORT, () => console.log(`✅ GrantFlow server running on port ${PORT}`));

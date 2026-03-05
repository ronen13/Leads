import { useState, useEffect } from "react";
import { api } from "../api";

const inputStyle = {
  background: "#1e293b", border: "1px solid #334155", borderRadius: 10,
  padding: "12px 14px", color: "#f1f5f9", fontSize: 15, width: "100%",
  outline: "none", boxSizing: "border-box", fontFamily: "'Heebo', sans-serif",
};
const labelStyle = { display: "block", color: "#94a3b8", marginBottom: 6, fontSize: 14, fontWeight: 600 };

const REGIONS = ["תל אביב והמרכז","ירושלים","חיפה והצפון","באר שבע והדרום","יהודה ושומרון","גולן ועמקים"];
const SECTORS = ["טכנולוגיה","תוכנה","סייבר","בינה מלאכותית","ייצור","מסחר","יצוא","שירותים","חקלאות","בנייה","רפואה","ביומד","אנרגיה","חינוך","תיירות","אחר"];

export default function LeadForm({ advisorCode }) {
  const [advisor, setAdvisor] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [matchedGrants, setMatchedGrants] = useState([]);
  const [form, setForm] = useState({
    businessName: "", ownerName: "", phone: "", email: "",
    businessType: "", sector: "", employees: "", annualRevenue: "",
    yearsActive: "", hasRnd: "", isExporter: "", region: "",
    challenges: "", additionalInfo: "",
  });

  useEffect(() => {
    api.getAdvisor(advisorCode)
      .then(setAdvisor)
      .catch(() => setNotFound(true));
  }, [advisorCode]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await api.createLead({ ...form, advisorCode });
      setMatchedGrants(result.matched_grants || []);
      setSubmitted(true);
    } catch (e) {
      alert("שגיאה בשליחת הטופס. נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#f1f5f9", fontFamily: "'Heebo', sans-serif", direction: "rtl" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔗</div>
        <h2 style={{ color: "#ef4444" }}>קישור לא תקין</h2>
        <p style={{ color: "#94a3b8" }}>הקישור שקיבלת אינו תקין. אנא פנה ליועץ שלך.</p>
      </div>
    </div>
  );

  if (!advisor) return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontSize: 20, fontFamily: "Heebo, sans-serif" }}>
      טוען...
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#f1f5f9", fontFamily: "'Heebo', sans-serif", direction: "rtl", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 640, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>✓</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#10b981", margin: 0 }}>הפרטים נשלחו בהצלחה!</h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>היועץ שלך, <strong style={{ color: "#f1f5f9" }}>{advisor.name}</strong>, יקבל את הפרטים ויצור קשר בהקדם.</p>
        </div>
        {matchedGrants.length > 0 && (
          <div style={{ background: "#1e293b", borderRadius: 16, padding: 24, border: "1px solid #334155" }}>
            <h3 style={{ color: "#f59e0b", marginTop: 0, marginBottom: 16 }}>🎯 מענקים פוטנציאליים לעסק שלך ({matchedGrants.length})</h3>
            {matchedGrants.map(g => (
              <div key={g.id} style={{ background: "#0f172a", borderRadius: 10, padding: "12px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#f1f5f9" }}>{g.name}</div>
                  <div style={{ color: "#10b981", fontSize: 13 }}>{g.amount}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#3b82f6" }}>{g.matchScore}%</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>התאמה</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #0d1b2e 100%)", fontFamily: "'Heebo', sans-serif", direction: "rtl", padding: "24px 16px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-block", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 12, padding: "8px 20px", fontSize: 13, fontWeight: 700, color: "white", marginBottom: 16 }}>
            {advisor.type === "cpa" ? "👨‍💼 רואה חשבון" : "⚖️ עורך דין"} | {advisor.name}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#f1f5f9", margin: "0 0 8px" }}>בדיקת זכאות למענקים</h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: 15 }}>מלא את הפרטים ונבדוק אילו מענקים מתאימים לעסק שלך</p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= step ? "linear-gradient(90deg,#3b82f6,#8b5cf6)" : "#1e293b", transition: "all 0.3s" }} />
          ))}
        </div>

        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 20, padding: 32 }}>
          {step === 1 && (
            <div>
              <h2 style={{ color: "#f1f5f9", marginTop: 0, marginBottom: 24 }}>👤 פרטי בעל העסק</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div><label style={labelStyle}>שם מלא *</label><input style={inputStyle} value={form.ownerName} onChange={e => set("ownerName", e.target.value)} placeholder="ישראל ישראלי" /></div>
                  <div><label style={labelStyle}>שם העסק *</label><input style={inputStyle} value={form.businessName} onChange={e => set("businessName", e.target.value)} placeholder='חברה בע"מ' /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div><label style={labelStyle}>טלפון *</label><input style={inputStyle} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="050-0000000" /></div>
                  <div><label style={labelStyle}>אימייל</label><input style={inputStyle} value={form.email} onChange={e => set("email", e.target.value)} placeholder="israel@email.com" /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>סוג עסק *</label>
                    <select style={inputStyle} value={form.businessType} onChange={e => set("businessType", e.target.value)}>
                      <option value="">בחר...</option>
                      <option>עוסק מורשה</option><option>חברה בע&quot;מ</option><option>שותפות</option><option>עמותה</option><option>קיבוץ/מושב</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>אזור גאוגרפי *</label>
                    <select style={inputStyle} value={form.region} onChange={e => set("region", e.target.value)}>
                      <option value="">בחר...</option>
                      {REGIONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ color: "#f1f5f9", marginTop: 0, marginBottom: 24 }}>🏢 פרטי העסק</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={labelStyle}>סקטור / תחום פעילות *</label>
                  <select style={inputStyle} value={form.sector} onChange={e => set("sector", e.target.value)}>
                    <option value="">בחר...</option>
                    {SECTORS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div><label style={labelStyle}>מספר עובדים</label><input style={inputStyle} type="number" value={form.employees} onChange={e => set("employees", e.target.value)} placeholder="10" /></div>
                  <div><label style={labelStyle}>שנות פעילות</label><input style={inputStyle} type="number" value={form.yearsActive} onChange={e => set("yearsActive", e.target.value)} placeholder="5" /></div>
                </div>
                <div>
                  <label style={labelStyle}>מחזור שנתי משוער (₪)</label>
                  <select style={inputStyle} value={form.annualRevenue} onChange={e => set("annualRevenue", e.target.value)}>
                    <option value="">בחר טווח...</option>
                    <option value="500000">עד ₪500,000</option>
                    <option value="1000000">₪500K – ₪1M</option>
                    <option value="5000000">₪1M – ₪5M</option>
                    <option value="10000000">₪5M – ₪10M</option>
                    <option value="50000000">₪10M – ₪50M</option>
                    <option value="100000000">מעל ₪50M</option>
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>האם יש פעילות מו"פ?</label>
                    <select style={inputStyle} value={form.hasRnd} onChange={e => set("hasRnd", e.target.value)}>
                      <option value="">בחר...</option><option value="yes">כן</option><option value="no">לא</option><option value="planning">מתכנן</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>האם העסק מייצא?</label>
                    <select style={inputStyle} value={form.isExporter} onChange={e => set("isExporter", e.target.value)}>
                      <option value="">בחר...</option><option value="yes">כן</option><option value="no">לא</option><option value="planning">מתכנן</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ color: "#f1f5f9", marginTop: 0, marginBottom: 24 }}>💬 מידע נוסף</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={labelStyle}>אתגרים עיקריים בעסק</label>
                  <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.challenges} onChange={e => set("challenges", e.target.value)} placeholder="תאר את האתגרים העיקריים..." />
                </div>
                <div>
                  <label style={labelStyle}>מידע נוסף רלוונטי</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.additionalInfo} onChange={e => set("additionalInfo", e.target.value)} placeholder="כל מידע נוסף שיכול לסייע..." />
                </div>
                <div style={{ background: "#1e293b", borderRadius: 12, padding: 16, border: "1px solid #334155" }}>
                  <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>🔒 המידע שלך מאובטח ומשמש אך ורק לצורך בדיקת זכאות למענקים.</p>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "space-between" }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 15, fontFamily: "'Heebo', sans-serif" }}>
                → חזור
              </button>
            )}
            <button
              onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()}
              disabled={loading || (step === 1 && (!form.ownerName || !form.businessName || !form.phone))}
              style={{ flex: 1, padding: "13px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white", cursor: "pointer", fontSize: 16, fontWeight: 700, fontFamily: "'Heebo', sans-serif", opacity: (loading || (step === 1 && (!form.ownerName || !form.businessName || !form.phone))) ? 0.5 : 1 }}
            >
              {loading ? "שולח..." : step < 3 ? "המשך ←" : "שלח ובדוק מענקים 🚀"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { api } from "../api";

function StatusBadge({ status }) {
  const map = {
    new: { label: "חדש", color: "#3b82f6" },
    reviewing: { label: "בבדיקה", color: "#f59e0b" },
    approved: { label: "אושר", color: "#10b981" },
    rejected: { label: "נדחה", color: "#ef4444" },
  };
  const s = map[status] || map.new;
  return (
    <span style={{ background: s.color + "22", color: s.color, border: `1px solid ${s.color}44`, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

export default function AdvisorDashboard({ advisorCode }) {
  const [advisor, setAdvisor] = useState(null);
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAdvisor(advisorCode),
      api.getLeadsByAdvisor(advisorCode),
    ]).then(([adv, l]) => {
      setAdvisor(adv);
      setLeads(l);
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [advisorCode]);

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#f1f5f9", fontFamily: "'Heebo', sans-serif", direction: "rtl" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔗</div>
        <h2 style={{ color: "#ef4444" }}>קישור לא תקין</h2>
        <p style={{ color: "#94a3b8" }}>הדאשבורד שחיפשת לא נמצא.</p>
      </div>
    </div>
  );

  if (loading || !advisor) return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontSize: 20, fontFamily: "Heebo, sans-serif" }}>
      טוען...
    </div>
  );

  const clientFormLink = `${window.location.origin}?advisor=${advisorCode}`;

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Heebo', sans-serif", direction: "rtl", color: "#f1f5f9" }}>
      {/* Header */}
      <div style={{ background: "#111827", borderBottom: "1px solid #1e293b", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{advisor.name}</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>{advisor.type === "cpa" ? "רואה חשבון" : "עורך דין"} · דאשבורד לידים</div>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#3b82f6" }}>{leads.length}</div>
            <div style={{ color: "#64748b", fontSize: 12 }}>לידים</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981" }}>{leads.filter(l => l.status === "approved").length}</div>
            <div style={{ color: "#64748b", fontSize: 12 }}>אושרו</div>
          </div>
          <button
            onClick={() => { navigator.clipboard?.writeText(clientFormLink); alert("הקישור הועתק!"); }}
            style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", border: "none", borderRadius: 8, color: "white", padding: "8px 16px", cursor: "pointer", fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: 13 }}
          >
            📋 העתק קישור ללקוח
          </button>
        </div>
      </div>

      <div style={{ padding: 24, display: "grid", gridTemplateColumns: selectedLead ? "1fr 420px" : "1fr", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
        <div>
          <h3 style={{ marginTop: 0, color: "#94a3b8", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>לקוחות שלי</h3>
          {leads.length === 0 ? (
            <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 48, textAlign: "center", color: "#475569" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <div style={{ marginBottom: 12 }}>עדיין אין לידים. שתף את הקישור שלך עם לקוחות.</div>
              <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 16px", display: "inline-block", color: "#3b82f6", fontSize: 13, cursor: "pointer", wordBreak: "break-all" }}
                onClick={() => { navigator.clipboard?.writeText(clientFormLink); alert("הועתק!"); }}>
                {clientFormLink}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {leads.map(lead => (
                <div key={lead.id} onClick={() => setSelectedLead(lead)}
                  style={{ background: selectedLead?.id === lead.id ? "#1e3a5f" : "#111827", border: `1px solid ${selectedLead?.id === lead.id ? "#3b82f6" : "#1e293b"}`, borderRadius: 12, padding: "14px 18px", cursor: "pointer", transition: "all 0.2s", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{lead.business_name} <span style={{ color: "#64748b", fontWeight: 400 }}>– {lead.owner_name}</span></div>
                    <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{lead.sector} · {lead.region} · {new Date(lead.submitted_at).toLocaleDateString("he-IL")}</div>
                  </div>
                  <div style={{ textAlign: "left", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <StatusBadge status={lead.status} />
                    <div style={{ color: "#f59e0b", fontSize: 12 }}>🎯 {lead.matched_grants?.length || 0} מענקים</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedLead && (
          <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 20, height: "fit-content", position: "sticky", top: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{selectedLead.business_name}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>{selectedLead.owner_name}</div>
              </div>
              <button onClick={() => setSelectedLead(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>

            {[
              ["📞 טלפון", selectedLead.phone], ["📧 אימייל", selectedLead.email],
              ["🏢 סוג עסק", selectedLead.business_type], ["🌍 אזור", selectedLead.region],
              ["👥 עובדים", selectedLead.employees], ["💰 מחזור", selectedLead.annual_revenue],
              ["📅 שנות פעילות", selectedLead.years_active],
              ["🔬 מו\"פ", selectedLead.has_rnd === "yes" ? "כן" : selectedLead.has_rnd === "no" ? "לא" : selectedLead.has_rnd],
              ["🌐 יצוא", selectedLead.is_exporter === "yes" ? "כן" : selectedLead.is_exporter === "no" ? "לא" : selectedLead.is_exporter],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e293b", fontSize: 14 }}>
                <span style={{ color: "#64748b" }}>{label}</span>
                <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{value}</span>
              </div>
            ))}

            {selectedLead.challenges && <div style={{ marginTop: 12, background: "#1e293b", borderRadius: 8, padding: 12, fontSize: 13, color: "#94a3b8" }}><strong>אתגרים:</strong> {selectedLead.challenges}</div>}

            {selectedLead.matched_grants?.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 12 }}>🎯 מענקים מתאימים</div>
                {selectedLead.matched_grants.map(g => (
                  <div key={g.id} style={{ background: "#0f172a", borderRadius: 8, padding: "10px 12px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{g.name}</div>
                      <div style={{ color: "#10b981", fontSize: 12 }}>{g.amount}</div>
                    </div>
                    <div style={{ color: "#3b82f6", fontWeight: 800, fontSize: 16 }}>{g.matchScore}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

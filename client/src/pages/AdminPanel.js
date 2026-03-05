import { useState, useEffect, useCallback } from "react";
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

const inputStyle = {
  background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
  padding: "10px 12px", color: "#f1f5f9", fontSize: 14,
  width: "100%", boxSizing: "border-box", fontFamily: "'Heebo', sans-serif", outline: "none",
};

export default function AdminPanel() {
  const [tab, setTab] = useState("leads");
  const [leads, setLeads] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [grants, setGrants] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newAdvisor, setNewAdvisor] = useState({ name: "", type: "cpa", email: "" });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [l, a, g] = await Promise.all([api.getLeads(), api.getAdvisors(), api.getGrants()]);
      setLeads(l);
      setAdvisors(a);
      setGrants(g);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (leadId, status) => {
    await api.updateLeadStatus(leadId, status);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    setSelectedLead(prev => prev?.id === leadId ? { ...prev, status } : prev);
  };

  const addAdvisor = async () => {
    if (!newAdvisor.name) return;
    const created = await api.createAdvisor(newAdvisor);
    setAdvisors(prev => [created, ...prev]);
    setNewAdvisor({ name: "", type: "cpa", email: "" });
  };

  const deleteAdvisor = async (code) => {
    if (!window.confirm("למחוק יועץ זה?")) return;
    await api.deleteAdvisor(code);
    setAdvisors(prev => prev.filter(a => a.code !== code));
  };

  const origin = window.location.origin;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0f1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontSize: 20, fontFamily: "Heebo, sans-serif" }}>
      טוען...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1a", fontFamily: "'Heebo', sans-serif", direction: "rtl", color: "#f1f5f9", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#0f172a", borderLeft: "1px solid #1e293b", padding: 20, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GrantFlow</div>
          <div style={{ color: "#475569", fontSize: 12, marginTop: 2 }}>פאנל ניהול</div>
        </div>
        {[
          { id: "leads", icon: "📋", label: "כל הלידים", count: leads.length },
          { id: "advisors", icon: "👥", label: "יועצים", count: advisors.length },
          { id: "grants", icon: "🎯", label: "מאגר מענקים", count: grants.length },
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "none", background: tab === item.id ? "#1e3a5f" : "transparent", color: tab === item.id ? "#3b82f6" : "#64748b", cursor: "pointer", fontFamily: "'Heebo', sans-serif", fontWeight: tab === item.id ? 700 : 400, fontSize: 14, marginBottom: 4, width: "100%", textAlign: "right" }}>
            <span>{item.icon}</span><span style={{ flex: 1 }}>{item.label}</span>
            <span style={{ background: "#1e293b", borderRadius: 20, padding: "1px 8px", fontSize: 11 }}>{item.count}</span>
          </button>
        ))}
        <div style={{ marginTop: "auto", padding: "12px 0", borderTop: "1px solid #1e293b" }}>
          <div style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>סטטיסטיקות</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "חדשים", val: leads.filter(l => l.status === "new").length, color: "#3b82f6" },
              { label: "אושרו", val: leads.filter(l => l.status === "approved").length, color: "#10b981" },
              { label: "בבדיקה", val: leads.filter(l => l.status === "reviewing").length, color: "#f59e0b" },
              { label: "נדחו", val: leads.filter(l => l.status === "rejected").length, color: "#ef4444" },
            ].map(s => (
              <div key={s.label} style={{ background: "#111827", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                <div style={{ color: s.color, fontWeight: 800, fontSize: 18 }}>{s.val}</div>
                <div style={{ color: "#475569", fontSize: 11 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
        {tab === "leads" && (
          <div style={{ display: "grid", gridTemplateColumns: selectedLead ? "1fr 440px" : "1fr", gap: 20 }}>
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 20 }}>כל הלידים</h2>
              {leads.length === 0 ? (
                <div style={{ background: "#111827", borderRadius: 16, padding: 48, textAlign: "center", color: "#475569", border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                  <div>עדיין לא הגיעו לידים</div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {leads.map(lead => (
                    <div key={lead.id} onClick={() => setSelectedLead(lead)}
                      style={{ background: selectedLead?.id === lead.id ? "#1e3a5f" : "#111827", border: `1px solid ${selectedLead?.id === lead.id ? "#3b82f6" : "#1e293b"}`, borderRadius: 12, padding: "14px 18px", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{lead.business_name}</div>
                        <div style={{ color: "#64748b", fontSize: 13 }}>{lead.owner_name} · {lead.phone}</div>
                      </div>
                      <div style={{ color: "#64748b", fontSize: 13 }}>
                        <div>{lead.advisor_name}</div>
                        <div>{lead.sector} · {lead.region}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                        <StatusBadge status={lead.status} />
                        <div style={{ color: "#f59e0b", fontSize: 12 }}>🎯 {lead.matched_grants?.length || 0}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedLead && (
              <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 24, height: "fit-content", position: "sticky", top: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 20 }}>{selectedLead.business_name}</div>
                    <div style={{ color: "#64748b" }}>{selectedLead.owner_name}</div>
                  </div>
                  <button onClick={() => setSelectedLead(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 20 }}>✕</button>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>עדכן סטטוס:</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["new", "reviewing", "approved", "rejected"].map(s => (
                      <button key={s} onClick={() => updateStatus(selectedLead.id, s)}
                        style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: selectedLead.status === s ? "#3b82f6" : "#1e293b", color: selectedLead.status === s ? "white" : "#64748b", cursor: "pointer", fontSize: 13, fontFamily: "'Heebo', sans-serif" }}>
                        {s === "new" ? "חדש" : s === "reviewing" ? "בבדיקה" : s === "approved" ? "אושר" : "נדחה"}
                      </button>
                    ))}
                  </div>
                </div>

                {[
                  ["📞", "טלפון", selectedLead.phone], ["📧", "אימייל", selectedLead.email],
                  ["🏢", "סוג עסק", selectedLead.business_type], ["🌍", "אזור", selectedLead.region],
                  ["🏭", "סקטור", selectedLead.sector], ["👥", "עובדים", selectedLead.employees],
                  ["💰", "מחזור", selectedLead.annual_revenue], ["📅", "שנות פעילות", selectedLead.years_active],
                  ["👨‍💼", "יועץ", selectedLead.advisor_name],
                ].filter(([,, v]) => v).map(([icon, label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e293b", fontSize: 14 }}>
                    <span style={{ color: "#64748b" }}>{icon} {label}</span>
                    <span style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}

                {selectedLead.challenges && <div style={{ marginTop: 12, background: "#1e293b", borderRadius: 8, padding: 12, fontSize: 13, color: "#94a3b8" }}><strong>אתגרים:</strong> {selectedLead.challenges}</div>}
                {selectedLead.additional_info && <div style={{ marginTop: 8, background: "#1e293b", borderRadius: 8, padding: 12, fontSize: 13, color: "#94a3b8" }}><strong>מידע נוסף:</strong> {selectedLead.additional_info}</div>}

                {selectedLead.matched_grants?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 10 }}>🎯 {selectedLead.matched_grants.length} מענקים מתאימים</div>
                    {selectedLead.matched_grants.map(g => (
                      <div key={g.id} style={{ background: "#0f172a", borderRadius: 8, padding: "10px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{g.name}</div>
                          <div style={{ color: "#10b981", fontSize: 12 }}>{g.amount}</div>
                        </div>
                        <div style={{ color: "#3b82f6", fontWeight: 800 }}>{g.matchScore}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "advisors" && (
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>יועצים ← קישורים ייחודיים</h2>

            <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <h3 style={{ marginTop: 0, color: "#94a3b8", fontSize: 14, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>הוסף יועץ חדש</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto", gap: 12, alignItems: "end" }}>
                <div><label style={{ display: "block", color: "#64748b", fontSize: 13, marginBottom: 4 }}>שם מלא</label>
                  <input style={inputStyle} value={newAdvisor.name} onChange={e => setNewAdvisor(p => ({ ...p, name: e.target.value }))} placeholder="שם היועץ" /></div>
                <div><label style={{ display: "block", color: "#64748b", fontSize: 13, marginBottom: 4 }}>סוג</label>
                  <select style={{ ...inputStyle, width: "auto" }} value={newAdvisor.type} onChange={e => setNewAdvisor(p => ({ ...p, type: e.target.value }))}>
                    <option value="cpa">רו"ח</option><option value="lawyer">עו"ד</option>
                  </select></div>
                <div><label style={{ display: "block", color: "#64748b", fontSize: 13, marginBottom: 4 }}>אימייל</label>
                  <input style={inputStyle} value={newAdvisor.email} onChange={e => setNewAdvisor(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" /></div>
                <button onClick={addAdvisor}
                  style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", color: "white", cursor: "pointer", fontFamily: "'Heebo', sans-serif", fontWeight: 700, whiteSpace: "nowrap" }}>
                  הוסף +
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {advisors.map(adv => {
                const advLeads = leads.filter(l => l.advisor_code === adv.code);
                const formLink = `${origin}?advisor=${adv.code}`;
                const dashLink = `${origin}?dashboard=${adv.code}`;
                return (
                  <div key={adv.id} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: "16px 20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto", gap: 16, alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{adv.name}</div>
                        <div style={{ color: "#64748b", fontSize: 13 }}>{adv.type === "cpa" ? "רואה חשבון" : "עורך דין"} · {adv.email}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#3b82f6" }}>{advLeads.length}</div>
                        <div style={{ color: "#64748b", fontSize: 11 }}>לידים</div>
                      </div>
                      <button onClick={() => { navigator.clipboard?.writeText(formLink); alert("קישור טופס הועתק!"); }}
                        style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 12, fontFamily: "'Heebo', sans-serif" }}>
                        📋 קישור טופס
                      </button>
                      <button onClick={() => { navigator.clipboard?.writeText(dashLink); alert("קישור דאשבורד הועתק!"); }}
                        style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #334155", background: "transparent", color: "#10b981", cursor: "pointer", fontSize: 12, fontFamily: "'Heebo', sans-serif" }}>
                        📊 קישור דאשבורד
                      </button>
                      <button onClick={() => deleteAdvisor(adv.code)}
                        style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#1e293b", color: "#ef4444", cursor: "pointer", fontSize: 13 }}>
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "grants" && (
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>מאגר המענקים</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {grants.map(g => (
                <div key={g.id} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{g.name}</div>
                      <div style={{ color: "#10b981", fontWeight: 700, fontSize: 15 }}>{g.amount}</div>
                      <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>עובדים: {g.minEmployees}–{g.maxEmployees} · סקטורים: {g.sectors.join(", ")}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: "#3b82f6" }}>{g.matchScore}%</div>
                      <div style={{ color: "#64748b", fontSize: 11 }}>ניקוד</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

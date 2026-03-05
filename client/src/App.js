import { useEffect, useState } from "react";
import LeadForm from "./pages/LeadForm";
import AdvisorDashboard from "./pages/AdvisorDashboard";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  const [page, setPage] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const advisor = params.get("advisor");
    const dashboard = params.get("dashboard");
    if (advisor) setPage({ type: "form", code: advisor });
    else if (dashboard) setPage({ type: "dashboard", code: dashboard });
    else setPage({ type: "admin" });
  }, []);

  if (!page) return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontSize: 20, fontFamily: "Heebo, sans-serif" }}>
      טוען...
    </div>
  );

  if (page.type === "form") return <LeadForm advisorCode={page.code} />;
  if (page.type === "dashboard") return <AdvisorDashboard advisorCode={page.code} />;
  return <AdminPanel />;
}

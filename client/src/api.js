const BASE = process.env.REACT_APP_API_URL || "";

async function req(method, path, body) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  // Advisors
  getAdvisors: () => req("GET", "/advisors"),
  getAdvisor: (code) => req("GET", `/advisors/${code}`),
  createAdvisor: (data) => req("POST", "/advisors", data),
  deleteAdvisor: (code) => req("DELETE", `/advisors/${code}`),

  // Leads
  getLeads: () => req("GET", "/leads"),
  getLeadsByAdvisor: (code) => req("GET", `/leads/by-advisor/${code}`),
  createLead: (data) => req("POST", "/leads", data),
  updateLeadStatus: (id, status) => req("PATCH", `/leads/${id}/status`, { status }),

  // Grants
  getGrants: () => req("GET", "/grants"),
};

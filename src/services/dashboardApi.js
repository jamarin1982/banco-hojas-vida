const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function apiGetDashboardStats(token) {
  const res = await fetch(`${API_URL}/api/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error cargando estadísticas");
  return res.json();
}

export async function apiGetCandidateMatches(token) {
  const res = await fetch(`${API_URL}/api/dashboard/candidate-matches`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error cargando matches de candidatos");
  return res.json();
}

export async function apiGetCandidatoStats(token) {
  const res = await fetch(`${API_URL}/api/dashboard/candidato-stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error cargando estadísticas del candidato");
  return res.json();
}

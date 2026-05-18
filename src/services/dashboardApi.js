const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function apiGetDashboardStats(token) {
  const res = await fetch(`${API_URL}/api/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error cargando estadísticas");
  return res.json();
}

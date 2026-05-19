const API_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}/api`;

function getToken() {
  return localStorage.getItem("bhv_token");
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// Obtener todas las vacantes
export async function fetchVacantes(estado = null, page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (estado) params.set("estado", estado);
  params.set("page", page);
  params.set("limit", limit);
  const response = await fetch(`${API_URL}/vacantes?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error cargando vacantes");
  return await response.json();
}

// Obtener una vacante específica
export async function fetchVacanteById(id) {
  const response = await fetch(`${API_URL}/vacantes/${id}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error cargando vacante");
  return await response.json();
}

// Crear nueva vacante
export async function createVacante(vacante) {
  const response = await fetch(`${API_URL}/vacantes`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(vacante),
  });
  if (!response.ok) throw new Error("Error creando vacante");
  return await response.json();
}

// Actualizar vacante
export async function updateVacante(id, vacante) {
  const response = await fetch(`${API_URL}/vacantes/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(vacante),
  });
  if (!response.ok) throw new Error("Error actualizando vacante");
  return await response.json();
}

// Eliminar vacante
export async function deleteVacante(id) {
  const response = await fetch(`${API_URL}/vacantes/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error eliminando vacante");
  return await response.json();
}

// Obtener candidatos sugeridos para una vacante
export async function fetchTopCandidatesForVacante(vacanteId, limit = 10) {
  const response = await fetch(`${API_URL}/vacantes/${vacanteId}/candidatos?limit=${limit}&_t=${Date.now()}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error obteniendo candidatos sugeridos");
  return await response.json();
}

// Recalcular matching para una vacante
export async function recalculateVacanteMatching(vacanteId) {
  const response = await fetch(`${API_URL}/vacantes/${vacanteId}/matching/recalcular`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error recalculando matching");
  return await response.json();
}

// Recalcular matching con IA para una vacante
export async function recalculateVacanteMatchingAI(vacanteId, token) {
  const response = await fetch(`${API_URL}/vacantes/${vacanteId}/matching/recalcular-ia`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Error recalculando matching con IA");
  return await response.json();
}

// Postularse a una vacante (candidato)
export async function applyToVacante(vacanteId, token) {
  const response = await fetch(`${API_URL}/vacantes/${vacanteId}/aplicar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Error al postularse a la vacante");
  }
  return await response.json();
}

// Generar perfil de vacante con IA
export async function generateVacantePerfil({ descripcion, titulo, cargo, ciudad }) {
  const response = await fetch(`${API_URL}/vacantes/generar-perfil`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ descripcion, titulo, cargo, ciudad }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Error generando perfil con IA");
  }
  return await response.json();
}

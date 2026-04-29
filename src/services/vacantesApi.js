const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("bhv_token");
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function handleResponse(response) {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Error ${response.status}`);
  }
  return response.json();
}

// ─── Públicas (no requieren token) ───────────────────────────────────────────

export async function fetchVacantes(estado = null) {
  const query = estado ? `?estado=${estado}` : "";
  const response = await fetch(`${API_URL}/vacantes${query}`);
  return handleResponse(response);
}

export async function fetchVacanteById(id) {
  const response = await fetch(`${API_URL}/vacantes/${id}`);
  return handleResponse(response);
}

// ─── Empresa (requieren token) ────────────────────────────────────────────────

export async function createVacante(vacante) {
  const response = await fetch(`${API_URL}/vacantes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(vacante),
  });
  return handleResponse(response);
}

export async function updateVacante(id, vacante) {
  const response = await fetch(`${API_URL}/vacantes/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(vacante),
  });
  return handleResponse(response);
}

export async function deleteVacante(id) {
  const response = await fetch(`${API_URL}/vacantes/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function fetchTopCandidatesForVacante(vacanteId, limit = 10) {
  const response = await fetch(
    `${API_URL}/vacantes/${vacanteId}/candidatos?limit=${limit}`,
    { headers: authHeaders() }
  );
  return handleResponse(response);
}

export async function recalculateVacanteMatching(vacanteId) {
  const response = await fetch(`${API_URL}/vacantes/${vacanteId}/matching/recalcular`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

// ─── Candidato (requiere token de candidato) ──────────────────────────────────

export async function applyToVacante(vacanteId, token) {
  const response = await fetch(`${API_URL}/vacantes/${vacanteId}/aplicar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

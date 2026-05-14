const API_URL = "http://localhost:4000/api";

// Obtener todas las vacantes
export async function fetchVacantes(estado = null) {
  const query = estado ? `?estado=${estado}` : "";
  const response = await fetch(`${API_URL}/vacantes${query}`);
  if (!response.ok) throw new Error("Error cargando vacantes");
  return await response.json();
}

// Obtener una vacante específica
export async function fetchVacanteById(id) {
  const response = await fetch(`${API_URL}/vacantes/${id}`);
  if (!response.ok) throw new Error("Error cargando vacante");
  return await response.json();
}

// Crear nueva vacante
export async function createVacante(vacante) {
  const response = await fetch(`${API_URL}/vacantes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vacante),
  });
  if (!response.ok) throw new Error("Error creando vacante");
  return await response.json();
}

// Actualizar vacante
export async function updateVacante(id, vacante) {
  const response = await fetch(`${API_URL}/vacantes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vacante),
  });
  if (!response.ok) throw new Error("Error actualizando vacante");
  return await response.json();
}

// Eliminar vacante
export async function deleteVacante(id) {
  const response = await fetch(`${API_URL}/vacantes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error eliminando vacante");
  return await response.json();
}

// Obtener candidatos sugeridos para una vacante
export async function fetchTopCandidatesForVacante(vacanteId, limit = 10) {
  const response = await fetch(`${API_URL}/vacantes/${vacanteId}/candidatos?limit=${limit}`);
  if (!response.ok) throw new Error("Error obteniendo candidatos sugeridos");
  return await response.json();
}

// Recalcular matching para una vacante
export async function recalculateVacanteMatching(vacanteId) {
  const response = await fetch(`${API_URL}/vacantes/${vacanteId}/matching/recalcular`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Error recalculando matching");
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

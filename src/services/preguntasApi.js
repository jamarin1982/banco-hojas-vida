const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function apiGetPreguntas(vacanteId) {
  const res = await fetch(`${API_URL}/api/preguntas/vacante/${vacanteId}`);
  if (!res.ok) throw new Error("Error al obtener preguntas");
  return res.json();
}

export async function apiCreatePregunta(token, vacanteId, data) {
  const res = await fetch(`${API_URL}/api/preguntas/vacante/${vacanteId}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear pregunta");
  return res.json();
}

export async function apiUpdatePregunta(token, preguntaId, data) {
  const res = await fetch(`${API_URL}/api/preguntas/${preguntaId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar pregunta");
  return res.json();
}

export async function apiDeletePregunta(token, preguntaId) {
  const res = await fetch(`${API_URL}/api/preguntas/${preguntaId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar pregunta");
  return res.json();
}

export async function apiGenerarPreguntas(token, vacanteData) {
  const res = await fetch(`${API_URL}/api/preguntas/generar`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(vacanteData),
  });
  if (!res.ok) throw new Error("Error al generar preguntas con IA");
  return res.json();
}

export async function apiSaveRespuestas(candidatoId, vacanteId, respuestas) {
  const res = await fetch(`${API_URL}/api/preguntas/respuestas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidatoId, vacanteId, respuestas }),
  });
  if (!res.ok) throw new Error("Error al guardar respuestas");
  return res.json();
}

export async function apiGetRespuestas(candidatoId, vacanteId) {
  const res = await fetch(`${API_URL}/api/preguntas/respuestas/${candidatoId}/${vacanteId}`);
  if (!res.ok) throw new Error("Error al obtener respuestas");
  return res.json();
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function toJson(response) {
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export function parseCandidate(candidate) {
  return {
    ...candidate,
    certificaciones: candidate.certificaciones
      ? candidate.certificaciones.split(",").map((item) => item.trim())
      : [],
  };
}

export function mapCandidateToForm(candidate) {
  return {
    nombre: candidate.nombre || "",
    ciudad: candidate.ciudad || "",
    cargo: candidate.cargo || "",
    experiencia: candidate.experiencia || "",
    certificaciones: (candidate.certificaciones || []).join(", "),
    disponibilidad: candidate.disponibilidad || "",
    jornada: candidate.jornada || "",
    aspiracion: candidate.aspiracion || "",
    observaciones: candidate.observaciones || "",
    cv: null,
  };
}

export async function fetchCandidates() {
  const response = await fetch(`${API_BASE_URL}/api/candidatos`);
  const data = await toJson(response);
  return data.map(parseCandidate);
}

export async function createCandidate(payload) {
  const response = await fetch(`${API_BASE_URL}/api/candidatos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return toJson(response);
}

export async function updateCandidate(candidateId, payload) {
  const response = await fetch(`${API_BASE_URL}/api/candidatos/${candidateId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return toJson(response);
}

export async function deleteCandidate(candidateId) {
  const response = await fetch(`${API_BASE_URL}/api/candidatos/${candidateId}`, {
    method: "DELETE",
  });

  return toJson(response);
}

export async function uploadCandidateCv(candidateId, file) {
  const formData = new FormData();
  formData.append("cv", file);

  const response = await fetch(`${API_BASE_URL}/api/candidatos/${candidateId}/cv`, {
    method: "POST",
    body: formData,
  });

  return toJson(response);
}

export async function analyzeCandidateCv(candidateId) {
  const response = await fetch(`${API_BASE_URL}/api/candidatos/${candidateId}/analyze-cv`, {
    method: "POST",
  });

  return toJson(response);
}

export function getCvUrl(cvPath) {
  return `${API_BASE_URL}/${cvPath}`;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function getToken(): string | null {
  return localStorage.getItem("bhv_token");
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

function toJson(response: Response): Promise<unknown> {
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export interface Candidate {
  id: number;
  nombre: string;
  ciudad: string;
  cargo: string;
  experiencia: number;
  certificaciones: string[];
  disponibilidad: string;
  jornada: string;
  aspiracion: number;
  estado: string;
  observaciones: string;
  cv_path?: string;
  tiene_usuario?: number;
}

export interface CandidateForm {
  nombre: string;
  ciudad: string;
  cargo: string;
  experiencia: string;
  certificaciones: string;
  disponibilidad: string;
  jornada: string;
  aspiracion: string;
  observaciones: string;
  cv: File | null;
}

export function parseCandidate(candidate: Record<string, unknown>): Candidate {
  return {
    ...candidate,
    certificaciones: (candidate.certificaciones as string)
      ? (candidate.certificaciones as string).split(",").map((item: string) => item.trim())
      : [],
  } as Candidate;
}

export function mapCandidateToForm(candidate: Candidate): CandidateForm {
  return {
    nombre: candidate.nombre || "",
    ciudad: candidate.ciudad || "",
    cargo: candidate.cargo || "",
    experiencia: String(candidate.experiencia || ""),
    certificaciones: (candidate.certificaciones || []).join(", "),
    disponibilidad: candidate.disponibilidad || "",
    jornada: candidate.jornada || "",
    aspiracion: String(candidate.aspiracion || ""),
    observaciones: candidate.observaciones || "",
    cv: null,
  };
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchCandidates(page = 1, limit = 20): Promise<PaginatedResponse<Candidate>> {
  const response = await fetch(`${API_BASE_URL}/api/candidatos?page=${page}&limit=${limit}`, {
    headers: authHeaders(),
  });
  const data = await toJson(response) as PaginatedResponse<Record<string, unknown>>;
  return {
    ...data,
    data: data.data.map(parseCandidate),
  };
}

export async function createCandidate(payload: Record<string, unknown>): Promise<{ id: number }> {
  const response = await fetch(`${API_BASE_URL}/api/candidatos`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return toJson(response) as Promise<{ id: number }>;
}

export async function updateCandidate(candidateId: number, payload: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/api/candidatos/${candidateId}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return toJson(response);
}

export async function deleteCandidate(candidateId: number): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/api/candidatos/${candidateId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return toJson(response);
}

export async function uploadCandidateCv(candidateId: number, file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append("cv", file);
  const response = await fetch(`${API_BASE_URL}/api/candidatos/${candidateId}/cv`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  return toJson(response);
}

export async function analyzeCandidateCv(candidateId: number): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/api/candidatos/${candidateId}/analyze-cv`, {
    method: "POST",
    headers: authHeaders(),
  });
  return toJson(response);
}

export async function analyzeCandidateCvGemini(candidateId: number): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/candidatos/${candidateId}/analyze-cv-gemini`, {
      method: "POST",
      headers: authHeaders(),
      signal: controller.signal,
    });
    return toJson(response) as Promise<Record<string, unknown>>;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw new Error("Gemini tardó demasiado. Intenta de nuevo.");
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getCvUrl(cvPath: string): string {
  return `${API_BASE_URL}/${cvPath}`;
}

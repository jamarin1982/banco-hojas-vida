const API_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}/api`;

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

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Vacante {
  id: number;
  titulo: string;
  descripcion: string;
  cargo: string;
  ciudad: string;
  experiencia_minima: number;
  experiencia_maxima: number;
  certificaciones_requeridas: string[];
  disponibilidad: string;
  jornada: string;
  salario_minimo: number | null;
  salario_maximo: number | null;
  estado: string;
  resumen?: string;
  responsabilidades?: string[];
  requisitos?: string[];
  ofrecemos?: string[];
}

export async function fetchVacantes(
  estado: string | null = null,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Vacante>> {
  const params = new URLSearchParams();
  if (estado) params.set("estado", estado);
  params.set("page", String(page));
  params.set("limit", String(limit));
  const response = await fetch(`${API_URL}/vacantes?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error cargando vacantes");
  return response.json() as Promise<PaginatedResponse<Vacante>>;
}

export async function fetchVacanteById(id: number): Promise<Vacante> {
  const response = await fetch(`${API_URL}/vacantes/${id}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error cargando vacante");
  return response.json() as Promise<Vacante>;
}

export async function createVacante(vacante: Record<string, unknown>): Promise<{ id: number }> {
  const response = await fetch(`${API_URL}/vacantes`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(vacante),
  });
  if (!response.ok) throw new Error("Error creando vacante");
  return response.json() as Promise<{ id: number }>;
}

export async function updateVacante(id: number, vacante: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(`${API_URL}/vacantes/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(vacante),
  });
  if (!response.ok) throw new Error("Error actualizando vacante");
  return response.json();
}

export async function deleteVacante(id: number): Promise<unknown> {
  const response = await fetch(`${API_URL}/vacantes/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error eliminando vacante");
  return response.json();
}

export async function fetchTopCandidatesForVacante(
  vacanteId: number,
  limit = 10
): Promise<unknown[]> {
  const response = await fetch(`${API_URL}/vacantes/${vacanteId}/candidatos?limit=${limit}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error obteniendo candidatos sugeridos");
  return response.json() as Promise<unknown[]>;
}

export async function recalculateVacanteMatching(vacanteId: number): Promise<{ message: string; scoresCount: number }> {
  const response = await fetch(`${API_URL}/vacantes/${vacanteId}/matching/recalcular`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error recalculando matching");
  return response.json() as Promise<{ message: string; scoresCount: number }>;
}

export async function recalculateVacanteMatchingAI(vacanteId: number): Promise<{ message: string; scoresCount: number; scores: { candidatoId: number; score: number; justificacion: string }[] }> {
  const response = await fetch(`${API_URL}/vacantes/${vacanteId}/matching/recalcular-ia`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error recalculando matching con IA");
  return response.json() as Promise<{ message: string; scoresCount: number; scores: { candidatoId: number; score: number; justificacion: string }[] }>;
}

export async function applyToVacante(vacanteId: number, token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/vacantes/${vacanteId}/aplicar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || "Error al postularse a la vacante");
  }
  return response.json() as Promise<{ message: string }>;
}

export async function generateVacantePerfil({
  descripcion,
  titulo,
  cargo,
  ciudad,
}: {
  descripcion: string;
  titulo?: string;
  cargo?: string;
  ciudad?: string;
}): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_URL}/vacantes/generar-perfil`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ descripcion, titulo, cargo, ciudad }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || "Error generando perfil con IA");
  }
  return response.json() as Promise<Record<string, unknown>>;
}

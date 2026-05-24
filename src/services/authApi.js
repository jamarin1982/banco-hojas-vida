const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function toJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function apiRegister({ nombre, email, password, rol, nombreEmpresa, cvFile, consentimiento }) {
  const body = cvFile ? new FormData() : JSON.stringify({ nombre, email, password, rol, nombreEmpresa, consentimiento });
  const headers = cvFile ? {} : { "Content-Type": "application/json" };

  if (cvFile) {
    body.append("nombre", nombre);
    body.append("email", email);
    body.append("password", password);
    body.append("rol", rol);
    if (nombreEmpresa) body.append("nombreEmpresa", nombreEmpresa);
    body.append("consentimiento", consentimiento ? "true" : "");
    body.append("cv", cvFile);
  }

  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers,
    body,
  });
  return toJson(res);
}

export async function apiLogin({ email, password, rolSolicitado }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, rolSolicitado }),
  });
  return toJson(res);
}

export async function apiMe(token) {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return toJson(res);
}

export async function apiForgotPassword(email) {
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return toJson(res);
}

export async function apiResetPassword({ token, password }) {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  return toJson(res);
}

export async function apiGetMiPerfil(token) {
  const res = await fetch(`${API_URL}/api/auth/mi-perfil`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return toJson(res);
}

export async function apiUpdateMiPerfil(token, datos) {
  const res = await fetch(`${API_URL}/api/auth/mi-perfil`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(datos),
  });
  return toJson(res);
}

export async function apiGetMisAplicaciones(token) {
  const res = await fetch(`${API_URL}/api/auth/mis-aplicaciones`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return toJson(res);
}

export async function apiSubirCvPerfil(token, file) {
  const formData = new FormData();
  formData.append("cv", file);
  const res = await fetch(`${API_URL}/api/auth/mi-perfil/cv`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return toJson(res);
}

export async function apiAnalizarCvPerfil(token) {
  const res = await fetch(`${API_URL}/api/auth/mi-perfil/analizar-cv`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return toJson(res);
}

export async function apiAnalizarCvPerfilGemini(token) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout
  try {
    const res = await fetch(`${API_URL}/api/auth/mi-perfil/analizar-cv-gemini`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    return toJson(res);
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Gemini tardó demasiado. Intenta de nuevo.");
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getCvPerfilUrl(cvPath) {
  return `${API_URL}/${cvPath}`;
}

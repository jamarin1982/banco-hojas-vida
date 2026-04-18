import { createHttpError } from "../utils/httpError.js";

function toSafeString(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function parseNumber(value, fieldName) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw createHttpError(400, `El campo '${fieldName}' debe ser un número válido mayor o igual a 0`);
  }
  return parsed;
}

export function validateCandidatePayload(req, res, next) {
  try {
    const payload = req.body || {};

    const normalized = {
      nombre: toSafeString(payload.nombre),
      ciudad: toSafeString(payload.ciudad),
      cargo: toSafeString(payload.cargo),
      experiencia: parseNumber(payload.experiencia, "experiencia"),
      certificaciones: toSafeString(payload.certificaciones),
      disponibilidad: toSafeString(payload.disponibilidad),
      jornada: toSafeString(payload.jornada),
      aspiracion: parseNumber(payload.aspiracion, "aspiracion"),
      estado: toSafeString(payload.estado) || "Aplicó",
      observaciones: toSafeString(payload.observaciones),
    };

    if (!normalized.nombre || !normalized.ciudad || !normalized.cargo) {
      throw createHttpError(400, "Los campos 'nombre', 'ciudad' y 'cargo' son obligatorios");
    }

    req.body = normalized;
    next();
  } catch (error) {
    next(error);
  }
}

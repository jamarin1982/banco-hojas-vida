import { verifyToken } from "../services/authService.js";
import { createHttpError } from "../utils/httpError.js";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  if (!token) return next(createHttpError(401, "Autenticación requerida."));

  const payload = verifyToken(token);
  if (!payload) return next(createHttpError(401, "Token inválido o expirado."));

  req.user = payload;
  next();
}

/** Middleware de rol — usar después de requireAuth */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return next(createHttpError(403, "No tienes permiso para realizar esta acción."));
    }
    next();
  };
}

import { createHttpError } from "../utils/httpError.js";

export function validateIdParam(req, res, next) {
  const { id } = req.params;
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return next(createHttpError(400, "El parámetro 'id' debe ser un entero positivo"));
  }

  req.params.id = String(parsedId);
  return next();
}

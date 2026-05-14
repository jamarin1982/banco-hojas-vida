import { Router } from "express";
import {
  listVacantes,
  listVacanteById,
  createVacanteHandler,
  updateVacanteHandler,
  deleteVacanteHandler,
  getTopCandidatesHandler,
  recalculateMatchingHandler,
  applyToVacanteHandler,
} from "../controllers/vacantesController.js";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";

const router = Router();

// Listar todas las vacantes con filtro opcional de estado
router.get("/", listVacantes);

// Obtener vacante por ID
router.get("/:id", listVacanteById);

// Crear nueva vacante
router.post("/", createVacanteHandler);

// Actualizar vacante
router.put("/:id", updateVacanteHandler);

// Eliminar vacante
router.delete("/:id", deleteVacanteHandler);

// Obtener top candidatos para una vacante
router.get("/:id/candidatos", getTopCandidatesHandler);

// Recalcular matching para una vacante
router.post("/:id/matching/recalcular", recalculateMatchingHandler);

// Postularse a una vacante (candidato autenticado)
router.post("/:id/aplicar", requireAuth, requireRole("candidato"), applyToVacanteHandler);

export default router;

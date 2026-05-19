import { Router } from "express";
import {
  listVacantes,
  listVacanteById,
  createVacanteHandler,
  updateVacanteHandler,
  deleteVacanteHandler,
  getTopCandidatesHandler,
  recalculateMatchingHandler,
  recalculateMatchingAIHandler,
  applyToVacanteHandler,
  generarPerfilVacanteHandler,
} from "../controllers/vacantesController.js";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";
import { aiLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Listar todas las vacantes con filtro opcional de estado
router.get("/", requireAuth, listVacantes);

// Obtener vacante por ID
router.get("/:id", requireAuth, listVacanteById);

// Crear nueva vacante
router.post("/", requireAuth, requireRole("empresa"), createVacanteHandler);

// Generar perfil de vacante con IA (antes de guardar)
router.post("/generar-perfil", requireAuth, requireRole("empresa"), aiLimiter, generarPerfilVacanteHandler);

// Actualizar vacante
router.put("/:id", requireAuth, requireRole("empresa"), updateVacanteHandler);

// Eliminar vacante
router.delete("/:id", requireAuth, requireRole("empresa"), deleteVacanteHandler);

// Obtener top candidatos para una vacante
router.get("/:id/candidatos", requireAuth, requireRole("empresa"), getTopCandidatesHandler);

// Recalcular matching para una vacante
router.post("/:id/matching/recalcular", requireAuth, requireRole("empresa"), recalculateMatchingHandler);

// Recalcular matching con IA para una vacante
router.post("/:id/matching/recalcular-ia", requireAuth, requireRole("empresa"), aiLimiter, recalculateMatchingAIHandler);

// Postularse a una vacante (candidato autenticado)
router.post("/:id/aplicar", requireAuth, requireRole("candidato"), applyToVacanteHandler);

export default router;

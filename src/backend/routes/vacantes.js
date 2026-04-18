import { Router } from "express";
import {
  listVacantes,
  listVacanteById,
  createVacanteHandler,
  updateVacanteHandler,
  deleteVacanteHandler,
  getTopCandidatesHandler,
  recalculateMatchingHandler,
} from "../controllers/vacantesController.js";

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

export default router;

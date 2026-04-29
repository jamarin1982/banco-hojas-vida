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

// ─── Públicas (cualquiera puede ver vacantes activas) ─────────────────────────
router.get("/", listVacantes);
router.get("/:id", listVacanteById);

// ─── Solo empresa ─────────────────────────────────────────────────────────────
router.post("/", requireAuth, requireRole("empresa"), createVacanteHandler);
router.put("/:id", requireAuth, requireRole("empresa"), updateVacanteHandler);
router.delete("/:id", requireAuth, requireRole("empresa"), deleteVacanteHandler);
router.get("/:id/candidatos", requireAuth, requireRole("empresa"), getTopCandidatesHandler);
router.post("/:id/matching/recalcular", requireAuth, requireRole("empresa"), recalculateMatchingHandler);

// ─── Candidatos autenticados pueden aplicar ───────────────────────────────────
router.post("/:id/aplicar", requireAuth, requireRole("candidato"), applyToVacanteHandler);

export default router;

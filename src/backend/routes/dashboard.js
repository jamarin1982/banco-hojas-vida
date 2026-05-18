import { Router } from "express";
import { getStatsHandler, getCandidateMatchesHandler, getCandidatoStatsHandler } from "../controllers/dashboardController.js";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";

const router = Router();

// Reclutador / empresa
router.get("/stats", requireAuth, requireRole("empresa"), getStatsHandler);
router.get("/candidate-matches", requireAuth, requireRole("empresa"), getCandidateMatchesHandler);

// Candidato
router.get("/candidato-stats", requireAuth, requireRole("candidato"), getCandidatoStatsHandler);

export default router;

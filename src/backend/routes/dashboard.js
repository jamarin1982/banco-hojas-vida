import { Router } from "express";
import { getStatsHandler, getCandidateMatchesHandler } from "../controllers/dashboardController.js";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";

const router = Router();

router.get("/stats", requireAuth, requireRole("empresa"), getStatsHandler);
router.get("/candidate-matches", requireAuth, requireRole("empresa"), getCandidateMatchesHandler);

export default router;

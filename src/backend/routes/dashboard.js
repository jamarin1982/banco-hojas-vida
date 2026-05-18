import { Router } from "express";
import { getStatsHandler } from "../controllers/dashboardController.js";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";

const router = Router();

// Solo empresas/reclutadores pueden ver stats globales
router.get("/stats", requireAuth, requireRole("empresa"), getStatsHandler);

export default router;

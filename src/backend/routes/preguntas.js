import { Router } from "express";
import {
  getPreguntasHandler,
  createPreguntaHandler,
  updatePreguntaHandler,
  deletePreguntaHandler,
  generarPreguntasHandler,
  saveRespuestasHandler,
  getRespuestasHandler,
} from "../controllers/preguntasController.js";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";

const router = Router();

// ─── Públicas (para candidatos que aplican) ──────────────────────────────────
router.get("/vacante/:vacanteId", getPreguntasHandler);
router.post("/respuestas", saveRespuestasHandler);
router.get("/respuestas/:candidatoId/:vacanteId", getRespuestasHandler);

// ─── Solo empresas/reclutadores ──────────────────────────────────────────────
router.post("/vacante/:vacanteId", requireAuth, requireRole("empresa"), createPreguntaHandler);
router.put("/:preguntaId", requireAuth, requireRole("empresa"), updatePreguntaHandler);
router.delete("/:preguntaId", requireAuth, requireRole("empresa"), deletePreguntaHandler);
router.post("/generar", requireAuth, requireRole("empresa"), generarPreguntasHandler);

export default router;

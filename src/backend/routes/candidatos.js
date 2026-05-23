import express from "express";
import { uploadCV } from "../middlewares/uploadCV.js";
import { validateCandidatePayload } from "../middlewares/validateCandidate.js";
import { validateIdParam } from "../middlewares/validateIdParam.js";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";
import { aiLimiter } from "../middlewares/rateLimiter.js";
import {
  analyzeCandidateCvHandler,
  analyzeCandidateCvGeminiHandler,
  createCandidateHandler,
  deleteCandidateHandler,
  enviarPruebaHandler,
  listCandidates,
  updateCandidateHandler,
  uploadCandidateCvHandler,
} from "../controllers/candidatosController.js";

const router = express.Router();

router.get("/",       requireAuth, requireRole("empresa"), listCandidates);
router.post("/",      requireAuth, requireRole("empresa"), validateCandidatePayload, createCandidateHandler);
router.delete("/:id", requireAuth, requireRole("empresa"), validateIdParam, deleteCandidateHandler);
router.put("/:id",    requireAuth, requireRole("empresa"), validateIdParam, validateCandidatePayload, updateCandidateHandler);
router.post("/:id/cv",           requireAuth, requireRole("empresa"), validateIdParam, uploadCV.single("cv"), uploadCandidateCvHandler);
router.post("/:id/enviar-prueba", requireAuth, requireRole("empresa"), validateIdParam, enviarPruebaHandler);
router.post("/:id/analyze-cv",   requireAuth, requireRole("empresa"), validateIdParam, aiLimiter, analyzeCandidateCvHandler);

// Gemini puede tardar hasta 60s — extender timeout de respuesta
router.post("/:id/analyze-cv-gemini", requireAuth, requireRole("empresa"), validateIdParam, aiLimiter,
  (req, res, next) => { res.setTimeout(90000); next(); },
  analyzeCandidateCvGeminiHandler
);

export default router;
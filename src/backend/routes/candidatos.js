import express from "express";
import { uploadCV } from "../middlewares/uploadCV.js";
import { validateCandidatePayload } from "../middlewares/validateCandidate.js";
import { validateIdParam } from "../middlewares/validateIdParam.js";
import {
  analyzeCandidateCvHandler,
  createCandidateHandler,
  deleteCandidateHandler,
  listCandidates,
  updateCandidateHandler,
  uploadCandidateCvHandler,
} from "../controllers/candidatosController.js";

const router = express.Router();

router.get("/", listCandidates);
router.post("/", validateCandidatePayload, createCandidateHandler);
router.delete("/:id", validateIdParam, deleteCandidateHandler);
router.put("/:id", validateIdParam, validateCandidatePayload, updateCandidateHandler);
router.post("/:id/cv", validateIdParam, uploadCV.single("cv"), uploadCandidateCvHandler);
router.post("/:id/analyze-cv", validateIdParam, analyzeCandidateCvHandler);

export default router;
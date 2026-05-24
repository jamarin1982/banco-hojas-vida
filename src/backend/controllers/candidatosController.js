import {
  analyzeCandidateCv,
  createCandidate,
  deleteCandidate,
  getAllCandidates,
  updateCandidate,
  updateCandidateCvPath,
} from "../services/candidatosService.js";
import { calculateMatchingForCandidate, enviarPruebaACandidato } from "../services/vacantesService.js";
import { pool } from "../db.js";
import { readCvPdf } from "../utils/readCvPdf.js";
import { analyzeCvWithGemini } from "../utils/cvGemini.js";

export async function listCandidates(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await getAllCandidates(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function createCandidateHandler(req, res, next) {
  try {
    const candidateId = await createCandidate(req.body);
    res.json({ id: candidateId });
  } catch (error) {
    next(error);
  }
}

export async function updateCandidateHandler(req, res, next) {
  try {
    const { id } = req.params;
    await updateCandidate(id, req.body);
    await calculateMatchingForCandidate(parseInt(id));
    res.json({ message: "Candidato actualizado" });
  } catch (error) {
    next(error);
  }
}

export async function deleteCandidateHandler(req, res, next) {
  try {
    const { id } = req.params;
    await deleteCandidate(id);
    res.json({ message: "Candidato eliminado" });
  } catch (error) {
    next(error);
  }
}

export async function uploadCandidateCvHandler(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Debes adjuntar un archivo PDF" });
    }

    const { id } = req.params;
    const filePath = req.file.path;
    await updateCandidateCvPath(id, filePath);
    return res.json({
      message: "CV subido correctamente",
      path: filePath,
    });
  } catch (error) {
    return next(error);
  }
}

export async function analyzeCandidateCvHandler(req, res, next) {
  try {
    const { id } = req.params;
    const analysis = await analyzeCandidateCv(id);
    return res.json(analysis);
  } catch (error) {
    return next(error);
  }
}

export async function analyzeCandidateCvGeminiHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { pool } = await import("../db.js");
    const [[candidate]] = await pool.query("SELECT cv_path FROM candidatos WHERE id = ?", [id]);
    if (!candidate?.cv_path) {
      return res.status(400).json({ error: "El candidato no tiene CV cargado." });
    }
    const text = await readCvPdf(candidate.cv_path);
    const analysis = await analyzeCvWithGemini(text);
    return res.json(analysis);
  } catch (error) {
    return next(error);
  }
}

export async function enviarPruebaHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { vacanteId, testLink } = req.body;
    if (!vacanteId) {
      return res.status(400).json({ error: "vacanteId es requerido" });
    }
    // Actualizar estado a Entrevista y enviar prueba
    await pool.query("UPDATE candidatos SET estado = 'Entrevista' WHERE id = ?", [parseInt(id)]);
    await enviarPruebaACandidato(parseInt(id), vacanteId, testLink);
    res.json({ message: "Estado actualizado y prueba enviada" });
  } catch (error) {
    next(error);
  }
}

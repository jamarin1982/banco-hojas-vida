import {
  analyzeCandidateCv,
  createCandidate,
  deleteCandidate,
  getAllCandidates,
  updateCandidate,
  updateCandidateCvPath,
} from "../services/candidatosService.js";

export async function listCandidates(req, res, next) {
  try {
    const candidates = await getAllCandidates();
    res.json(candidates);
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

import {
  getAllVacantes,
  getVacanteById,
  createVacante,
  updateVacante,
  deleteVacante,
  calculateMatchingScores,
  getTopCandidatesForVacante,
  applyToVacante as applyToVacanteService,
  notificarCandidatosMatch,
  generarPerfilVacante,
} from "../services/vacantesService.js";
import { logger } from "../utils/logger.js";

export async function listVacantes(req, res, next) {
  try {
    const { estado } = req.query;
    const vacantes = await getAllVacantes(estado);
    res.json(vacantes);
  } catch (error) {
    next(error);
  }
}

export async function listVacanteById(req, res, next) {
  try {
    const { id } = req.params;
    const vacante = await getVacanteById(id);
    res.json(vacante);
  } catch (error) {
    next(error);
  }
}

export async function createVacanteHandler(req, res, next) {
  try {
    const vacanteId = await createVacante(req.body);
    
    // Calcular matching automáticamente
    await calculateMatchingScores(vacanteId);

    // Notificar por email a candidatos con match >= 75%
    await notificarCandidatosMatch(vacanteId);
    
    res.json({ 
      id: vacanteId,
      message: "Vacante creada y matching calculado automáticamente" 
    });
  } catch (error) {
    next(error);
  }
}

export async function updateVacanteHandler(req, res, next) {
  try {
    const { id } = req.params;
    await updateVacante(id, req.body);
    
    // Recalcular matching
    await calculateMatchingScores(id);
    
    res.json({ message: "Vacante actualizada y matching recalculado" });
  } catch (error) {
    next(error);
  }
}

export async function deleteVacanteHandler(req, res, next) {
  try {
    const { id } = req.params;
    await deleteVacante(id);
    res.json({ message: "Vacante eliminada" });
  } catch (error) {
    next(error);
  }
}

export async function getTopCandidatesHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { limit } = req.query;
    const candidates = await getTopCandidatesForVacante(id, parseInt(limit) || 10);
    res.json(candidates);
  } catch (error) {
    next(error);
  }
}

export async function recalculateMatchingHandler(req, res, next) {
  try {
    const { id } = req.params;
    const scores = await calculateMatchingScores(id);
    res.json({ 
      message: "Matching recalculado",
      scoresCount: scores.length
    });
  } catch (error) {
    next(error);
  }
}

export async function applyToVacanteHandler(req, res, next) {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const result = await applyToVacanteService(Number(id), usuarioId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function generarPerfilVacanteHandler(req, res, next) {
  try {
    const { descripcion, titulo, cargo, ciudad } = req.body;
    if (!descripcion?.trim()) {
      return res.status(400).json({ error: "La descripción es obligatoria para generar el perfil." });
    }
    const perfil = await generarPerfilVacante({ descripcion: descripcion.trim(), titulo, cargo, ciudad });
    res.json(perfil);
  } catch (error) {
    next(error);
  }
}

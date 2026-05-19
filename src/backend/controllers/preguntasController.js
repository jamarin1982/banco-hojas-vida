import {
  getPreguntasByVacante,
  createPregunta,
  updatePregunta,
  deletePregunta,
  generarPreguntasIA,
  saveCandidatoRespuestas,
  getCandidatoRespuestas,
} from "../services/preguntasService.js";

export async function getPreguntasHandler(req, res, next) {
  try {
    const { vacanteId } = req.params;
    const preguntas = await getPreguntasByVacante(vacanteId);
    res.json(preguntas);
  } catch (err) {
    next(err);
  }
}

export async function createPreguntaHandler(req, res, next) {
  try {
    const { vacanteId } = req.params;
    const { tipo, pregunta, orden } = req.body;
    const nueva = await createPregunta(vacanteId, tipo, pregunta, orden);
    res.status(201).json(nueva);
  } catch (err) {
    next(err);
  }
}

export async function updatePreguntaHandler(req, res, next) {
  try {
    const { preguntaId } = req.params;
    const updated = await updatePregunta(preguntaId, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deletePreguntaHandler(req, res, next) {
  try {
    const { preguntaId } = req.params;
    await deletePregunta(preguntaId);
    res.json({ message: "Pregunta eliminada." });
  } catch (err) {
    next(err);
  }
}

export async function generarPreguntasHandler(req, res, next) {
  try {
    const preguntas = await generarPreguntasIA(req.body);
    res.json(preguntas);
  } catch (err) {
    next(err);
  }
}

export async function saveRespuestasHandler(req, res, next) {
  try {
    const { candidatoId, vacanteId, respuestas } = req.body;
    await saveCandidatoRespuestas(candidatoId, vacanteId, respuestas);
    res.json({ message: "Respuestas guardadas." });
  } catch (err) {
    next(err);
  }
}

export async function getRespuestasHandler(req, res, next) {
  try {
    const { candidatoId, vacanteId } = req.params;
    const respuestas = await getCandidatoRespuestas(candidatoId, vacanteId);
    res.json(respuestas);
  } catch (err) {
    next(err);
  }
}

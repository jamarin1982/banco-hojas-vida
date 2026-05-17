import { pool } from "../db.js";
import { createHttpError } from "../utils/httpError.js";
import { logger } from "../utils/logger.js";
import { analyzeCvWithGemini } from "../utils/cvGemini.js";

export async function getPreguntasByVacante(vacanteId) {
  const [rows] = await pool.query(
    "SELECT * FROM vacante_preguntas WHERE vacante_id = ? ORDER BY tipo, orden",
    [vacanteId]
  );
  return rows;
}

export async function createPregunta(vacanteId, tipo, pregunta, orden = 0) {
  const tiposValidos = ["informativa", "calificatoria", "excluyente"];
  if (!tiposValidos.includes(tipo)) {
    throw createHttpError(400, "Tipo de pregunta inválido.");
  }
  if (!pregunta?.trim()) {
    throw createHttpError(400, "La pregunta es obligatoria.");
  }
  const [result] = await pool.query(
    "INSERT INTO vacante_preguntas (vacante_id, tipo, pregunta, orden) VALUES (?, ?, ?, ?)",
    [vacanteId, tipo, pregunta.trim(), orden]
  );
  const [[nueva]] = await pool.query("SELECT * FROM vacante_preguntas WHERE id = ?", [result.insertId]);
  return nueva;
}

export async function updatePregunta(preguntaId, data) {
  const [[existing]] = await pool.query("SELECT * FROM vacante_preguntas WHERE id = ?", [preguntaId]);
  if (!existing) throw createHttpError(404, "Pregunta no encontrada.");

  const tiposValidos = ["informativa", "calificatoria", "excluyente"];
  const tipo = data.tipo || existing.tipo;
  if (!tiposValidos.includes(tipo)) {
    throw createHttpError(400, "Tipo de pregunta inválido.");
  }

  await pool.query(
    "UPDATE vacante_preguntas SET tipo = ?, pregunta = ?, orden = ? WHERE id = ?",
    [tipo, data.pregunta?.trim() || existing.pregunta, data.orden ?? existing.orden, preguntaId]
  );
  const [[updated]] = await pool.query("SELECT * FROM vacante_preguntas WHERE id = ?", [preguntaId]);
  return updated;
}

export async function deletePregunta(preguntaId) {
  const [result] = await pool.query("DELETE FROM vacante_preguntas WHERE id = ?", [preguntaId]);
  if (result.affectedRows === 0) throw createHttpError(404, "Pregunta no encontrada.");
  return { message: "Pregunta eliminada." };
}

export async function deletePreguntasByVacante(vacanteId) {
  await pool.query("DELETE FROM vacante_preguntas WHERE vacante_id = ?", [vacanteId]);
}

export async function generarPreguntasIA(vacanteData) {
  const { titulo, cargo, ciudad, descripcion, requisitos, experiencia_minima } = vacanteData;

  const prompt = `Eres un experto en reclutamiento. Genera preguntas para una vacante de empleo.

Datos de la vacante:
- Título: ${titulo || "N/A"}
- Cargo: ${cargo || "N/A"}
- Ciudad: ${ciudad || "N/A"}
- Descripción: ${descripcion || "N/A"}
- Requisitos: ${requisitos || "N/A"}
- Experiencia mínima: ${experiencia_minima || 0} años

Genera EXACTAMENTE 6 preguntas en formato JSON con esta estructura:
{
  "informativas": [
    {"pregunta": "texto de la pregunta"},
    {"pregunta": "texto de la pregunta"}
  ],
  "calificatorias": [
    {"pregunta": "texto de la pregunta"},
    {"pregunta": "texto de la pregunta"}
  ],
  "excluyentes": [
    {"pregunta": "texto de la pregunta"},
    {"pregunta": "texto de la pregunta"}
  ]
}

Reglas:
- Informativas: Preguntas para conocer mejor al candidato (ej: "¿Cuál es tu disponibilidad para iniciar?")
- Calificatorias: Preguntas que evalúan competencias clave (ej: "¿Cuántos años de experiencia tienes con esta tecnología?")
- Excluyentes: Preguntas de sí/no que pueden descartar candidatos (ej: "¿Tienes disponibilidad para viajar?")
- Las preguntas deben ser relevantes para el cargo descrito
- Usa lenguaje profesional y claro
- NO incluyas campos adicionales, solo "pregunta" en cada objeto

Responde SOLO con el JSON válido, sin explicaciones adicionales.`;

  try {
    const response = await analyzeCvWithGemini(prompt);
    let jsonStr = response;

    // Extraer JSON si viene envuelto en markdown
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    const preguntas = [];

    // Procesar informativas
    if (Array.isArray(parsed.informativas)) {
      parsed.informativas.forEach((p, i) => {
        if (p.pregunta) preguntas.push({ tipo: "informativa", pregunta: p.pregunta, orden: i + 1 });
      });
    }

    // Procesar calificatorias
    if (Array.isArray(parsed.calificatorias)) {
      parsed.calificatorias.forEach((p, i) => {
        if (p.pregunta) preguntas.push({ tipo: "calificatoria", pregunta: p.pregunta, orden: i + 1 });
      });
    }

    // Procesar excluyentes
    if (Array.isArray(parsed.excluyentes)) {
      parsed.excluyentes.forEach((p, i) => {
        if (p.pregunta) preguntas.push({ tipo: "excluyente", pregunta: p.pregunta, orden: i + 1 });
      });
    }

    logger.info(`IA generó ${preguntas.length} preguntas para vacante`);
    return preguntas;
  } catch (err) {
    logger.error(`Error generando preguntas con IA: ${err.message}`);
    throw createHttpError(500, "Error al generar preguntas con IA. Intenta de nuevo.");
  }
}

export async function saveCandidatoRespuestas(candidatoId, vacanteId, respuestas) {
  for (const r of respuestas) {
    await pool.query(
      "INSERT INTO candidato_respuestas_preguntas (candidato_id, vacante_id, pregunta_id, respuesta) VALUES (?, ?, ?, ?)",
      [candidatoId, vacanteId, r.preguntaId, r.respuesta || ""]
    );
  }
}

export async function getCandidatoRespuestas(candidatoId, vacanteId) {
  const [rows] = await pool.query(
    `SELECT crp.*, vp.pregunta, vp.tipo 
     FROM candidato_respuestas_preguntas crp 
     JOIN vacante_preguntas vp ON crp.pregunta_id = vp.id 
     WHERE crp.candidato_id = ? AND crp.vacante_id = ?`,
    [candidatoId, vacanteId]
  );
  return rows;
}

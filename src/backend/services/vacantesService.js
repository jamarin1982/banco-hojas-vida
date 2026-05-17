import { pool } from "../db.js";
import { createHttpError } from "../utils/httpError.js";
import { logger } from "../utils/logger.js";
import { sendVacanteNotificationEmail } from "../utils/mailer.js";
import { analyzeCvWithGemini } from "../utils/cvGemini.js";

export async function getAllVacantes(estado = null) {
  try {
    let query = "SELECT * FROM vacantes";
    const params = [];

    if (estado) {
      query += " WHERE estado = ?";
      params.push(estado);
    }

    query += " ORDER BY fecha_creacion DESC";
    const [rows] = await pool.query(query, params);
    
    return rows.map((vacante) => ({
      ...vacante,
      certificaciones_requeridas: vacante.certificaciones_requeridas
        ? JSON.parse(vacante.certificaciones_requeridas)
        : [],
      responsabilidades: vacante.responsabilidades
        ? JSON.parse(vacante.responsabilidades)
        : [],
      requisitos: vacante.requisitos
        ? JSON.parse(vacante.requisitos)
        : [],
      ofrecemos: vacante.ofrecemos
        ? JSON.parse(vacante.ofrecemos)
        : [],
    }));
  } catch (error) {
    logger.error("Error obteniendo vacantes:", error);
    throw error;
  }
}

export async function getVacanteById(id) {
  try {
    const [[vacante]] = await pool.query("SELECT * FROM vacantes WHERE id = ?", [id]);

    if (!vacante) {
      throw createHttpError(404, "Vacante no encontrada");
    }

    return {
      ...vacante,
      certificaciones_requeridas: vacante.certificaciones_requeridas
        ? JSON.parse(vacante.certificaciones_requeridas)
        : [],
      responsabilidades: vacante.responsabilidades
        ? JSON.parse(vacante.responsabilidades)
        : [],
      requisitos: vacante.requisitos
        ? JSON.parse(vacante.requisitos)
        : [],
      ofrecemos: vacante.ofrecemos
        ? JSON.parse(vacante.ofrecemos)
        : [],
    };
  } catch (error) {
    logger.error(`Error obteniendo vacante ${id}:`, error);
    throw error;
  }
}

export async function createVacante(vacante) {
  try {
    const now = new Date().toISOString();
    const [result] = await pool.query(
      `INSERT INTO vacantes
       (titulo, descripcion, resumen, responsabilidades, requisitos, ofrecemos, cargo, ciudad, experiencia_minima, experiencia_maxima,
        certificaciones_requeridas, disponibilidad, jornada, salario_minimo, salario_maximo, estado,
        fecha_creacion, fecha_actualizacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vacante.titulo,
        vacante.descripcion || null,
        vacante.resumen || null,
        JSON.stringify(vacante.responsabilidades || []),
        JSON.stringify(vacante.requisitos || []),
        JSON.stringify(vacante.ofrecemos || []),
        vacante.cargo,
        vacante.ciudad,
        vacante.experiencia_minima || 0,
        vacante.experiencia_maxima || 50,
        JSON.stringify(vacante.certificaciones_requeridas || []),
        vacante.disponibilidad || "Inmediata",
        vacante.jornada || "Completa",
        vacante.salario_minimo || null,
        vacante.salario_maximo || null,
        vacante.estado || "Activa",
        now,
        now,
      ]
    );

    logger.info(`Vacante creada: ${result.insertId}`);
    return result.insertId;
  } catch (error) {
    logger.error("Error creando vacante:", error);
    throw error;
  }
}

export async function updateVacante(id, vacante) {
  try {
    const now = new Date().toISOString();
    await pool.query(
      `UPDATE vacantes SET
        titulo = ?,
        descripcion = ?,
        resumen = ?,
        responsabilidades = ?,
        requisitos = ?,
        ofrecemos = ?,
        cargo = ?,
        ciudad = ?,
        experiencia_minima = ?,
        experiencia_maxima = ?,
        certificaciones_requeridas = ?,
        disponibilidad = ?,
        jornada = ?,
        salario_minimo = ?,
        salario_maximo = ?,
        estado = ?,
        fecha_actualizacion = ?
       WHERE id = ?`,
      [
        vacante.titulo,
        vacante.descripcion || null,
        vacante.resumen || null,
        JSON.stringify(vacante.responsabilidades || []),
        JSON.stringify(vacante.requisitos || []),
        JSON.stringify(vacante.ofrecemos || []),
        vacante.cargo,
        vacante.ciudad,
        vacante.experiencia_minima || 0,
        vacante.experiencia_maxima || 50,
        JSON.stringify(vacante.certificaciones_requeridas || []),
        vacante.disponibilidad || "Inmediata",
        vacante.jornada || "Completa",
        vacante.salario_minimo || null,
        vacante.salario_maximo || null,
        vacante.estado || "Activa",
        now,
        id,
      ]
    );

    logger.info(`Vacante actualizada: ${id}`);
  } catch (error) {
    logger.error(`Error actualizando vacante ${id}:`, error);
    throw error;
  }
}

export async function deleteVacante(id) {
  try {
    const [result] = await pool.query("DELETE FROM vacantes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      throw createHttpError(404, "Vacante no encontrada");
    }

    logger.info(`Vacante eliminada: ${id}`);
  } catch (error) {
    logger.error(`Error eliminando vacante ${id}:`, error);
    throw error;
  }
}

// Postularse a una vacante (candidato autenticado)
export async function applyToVacante(vacanteId, usuarioId) {
  try {
    const [[usuario]] = await pool.query("SELECT candidato_id FROM usuarios WHERE id = ?", [usuarioId]);
    if (!usuario?.candidato_id) {
      throw createHttpError(404, "No tienes un perfil de candidato asociado.");
    }

    const [[existing]] = await pool.query(
      "SELECT id FROM vacante_candidato_score WHERE vacante_id = ? AND candidato_id = ?",
      [vacanteId, usuario.candidato_id]
    );
    if (existing) {
      throw createHttpError(409, "Ya te has postulado a esta vacante.");
    }

    const now = new Date().toISOString();
    await pool.query(
      `INSERT INTO vacante_candidato_score (vacante_id, candidato_id, score_total, score_experiencia, score_certificaciones, score_ubicacion, score_disponibilidad, estado_aplicacion, fecha_score)
       VALUES (?, ?, 0, 0, 0, 0, 0, 'Aplicó', ?)`,
      [vacanteId, usuario.candidato_id, now]
    );

    logger.info(`Candidato ${usuario.candidato_id} postulado a vacante ${vacanteId}`);
    return { message: "Te has postulado exitosamente a la vacante." };
  } catch (error) {
    if (error.status) throw error;
    logger.error(`Error postulando a vacante ${vacanteId}:`, error);
    throw error;
  }
}

// Matching automático
export async function calculateMatchingScores(vacanteId) {
  try {
    const now = new Date().toISOString();
    const vacante = await getVacanteById(vacanteId);
    const [[{ results }]] = await pool.query(
      "SELECT COUNT(*) as results FROM candidatos WHERE estado IN ('Aplicó', 'Aprobado')"
    );

    const [candidatos] = await pool.query(
      "SELECT * FROM candidatos WHERE estado IN ('Aplicó', 'Aprobado') ORDER BY id DESC"
    );

    const scores = candidatos.map((candidato) => {
      const scoreExperiencia = calculateExperienceScore(
        candidato.experiencia,
        vacante.experiencia_minima,
        vacante.experiencia_maxima
      );

      const scoreCertificaciones = calculateCertificationsScore(
        candidato.certificaciones || "",
        vacante.certificaciones_requeridas || []
      );

      const scoreUbicacion = candidato.ciudad === vacante.ciudad ? 100 : 40;
      const scoreDisponibilidad = candidato.disponibilidad === vacante.disponibilidad ? 100 : 70;

      const scoreTotal = Math.round(
        scoreExperiencia * 0.35 +
        scoreCertificaciones * 0.35 +
        scoreUbicacion * 0.15 +
        scoreDisponibilidad * 0.15
      );

      return {
        vacanteId,
        candidatoId: candidato.id,
        scoreTotalValue: scoreTotal,
        scoreExperienciaValue: scoreExperiencia,
        scoreCertificacionesValue: scoreCertificaciones,
        scoreUbicacionValue: scoreUbicacion,
        scoreDisponibilidadValue: scoreDisponibilidad,
      };
    });

    // Guardar scores en BD
    for (const score of scores) {
      await pool.query(
        `INSERT INTO vacante_candidato_score
         (vacante_id, candidato_id, score_total, score_experiencia, score_certificaciones, 
          score_ubicacion, score_disponibilidad, fecha_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         score_total = ?,
         score_experiencia = ?,
         score_certificaciones = ?,
         score_ubicacion = ?,
         score_disponibilidad = ?,
         fecha_score = ?`,
        [
          score.vacanteId,
          score.candidatoId,
          score.scoreTotalValue,
          score.scoreExperienciaValue,
          score.scoreCertificacionesValue,
          score.scoreUbicacionValue,
          score.scoreDisponibilidadValue,
          now,
          score.scoreTotalValue,
          score.scoreExperienciaValue,
          score.scoreCertificacionesValue,
          score.scoreUbicacionValue,
          score.scoreDisponibilidadValue,
          now,
        ]
      );
    }

    logger.info(`Scores de matching calculados para vacante ${vacanteId}`);
    return scores;
  } catch (error) {
    logger.error(`Error calculando matching scores:`, error);
    throw error;
  }
}

// Generar perfil de vacante con IA
export async function generarPerfilVacante({ descripcion, titulo, cargo, ciudad }) {
  try {
    const prompt = `Sos un experto en recursos humanos. Generá una descripción profesional de cargo en español.

Analizá la siguiente información de una vacante y generá una ficha profesional estructurada en formato JSON estricto.
Responde ÚNICAMENTE con el JSON, sin texto adicional, sin markdown, sin bloques de código.

Formato requerido:
{
  "titulo": "título formal del cargo",
  "cargo": "nombre del cargo estándar",
  "ciudad": "ciudad mencionada o sugerida",
  "resumen": "2-3 oraciones describiendo el rol de forma profesional",
  "responsabilidades": ["responsabilidad 1", "responsabilidad 2", "responsabilidad 3", "responsabilidad 4", "responsabilidad 5"],
  "requisitos": ["requisito 1", "requisito 2", "requisito 3", "requisito 4"],
  "ofrecemos": ["beneficio 1", "beneficio 2", "beneficio 3"],
  "experiencia_minima": número entero de años mínimos,
  "experiencia_maxima": número entero de años máximos,
  "certificaciones_requeridas": ["tecnología1", "tecnología2"],
  "jornada": "Completa, Media Jornada o Por Proyecto",
  "disponibilidad": "Inmediata, 15 días o 30 días",
  "salario_minimo": número sugerido o 0 si no hay referencia,
  "salario_maximo": número sugerido o 0 si no hay referencia
}

Reglas:
- "resumen" debe ser un texto de 2-3 oraciones que describa el rol de forma atractiva y profesional
- "responsabilidades" debe tener exactamente 5 responsabilidades clave del cargo
- "requisitos" debe tener exactamente 4 requisitos esenciales (educación, experiencia, habilidades técnicas, habilidades blandas)
- "ofrecemos" debe tener exactamente 3 beneficios o ventajas de trabajar en la empresa
- "experiencia_minima" y "experiencia_maxima" deben ser números enteros
- "certificaciones_requeridas" debe ser un array de strings con tecnologías, herramientas o certificaciones relevantes
- "salario_minimo" y "salario_maximo" deben ser números (0 si no hay referencia)
- Si no encontrás un dato, usá valores por defecto razonables para el contexto
- No inventés información que no esté en la descripción

Información adicional proporcionada (puede estar vacía):
- Título: ${titulo || "(no proporcionado)"}
- Cargo: ${cargo || "(no proporcionado)"}
- Ciudad: ${ciudad || "(no proporcionado)"}

Descripción de la vacante:
${descripcion}`;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw createHttpError(503, "Gemini API no está configurada.");
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    logger.info("Generando perfil de vacante con Gemini");
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) {
        throw createHttpError(502, "Gemini no devolvió un formato válido.");
      }
      parsed = JSON.parse(match[0]);
    }

    const perfil = {
      titulo: typeof parsed.titulo === "string" ? parsed.titulo.trim() : titulo || "",
      cargo: typeof parsed.cargo === "string" ? parsed.cargo.trim() : cargo || "",
      ciudad: typeof parsed.ciudad === "string" ? parsed.ciudad.trim() : ciudad || "",
      resumen: typeof parsed.resumen === "string" ? parsed.resumen.trim() : "",
      responsabilidades: Array.isArray(parsed.responsabilidades) ? parsed.responsabilidades.filter(Boolean) : [],
      requisitos: Array.isArray(parsed.requisitos) ? parsed.requisitos.filter(Boolean) : [],
      ofrecemos: Array.isArray(parsed.ofrecemos) ? parsed.ofrecemos.filter(Boolean) : [],
      descripcion: typeof parsed.descripcion === "string" ? parsed.descripcion.trim() : descripcion,
      experiencia_minima: typeof parsed.experiencia_minima === "number" ? parsed.experiencia_minima : 0,
      experiencia_maxima: typeof parsed.experiencia_maxima === "number" ? parsed.experiencia_maxima : 10,
      certificaciones_requeridas: Array.isArray(parsed.certificaciones_requeridas)
        ? parsed.certificaciones_requeridas.filter(Boolean)
        : [],
      jornada: typeof parsed.jornada === "string" ? parsed.jornada : "Completa",
      disponibilidad: typeof parsed.disponibilidad === "string" ? parsed.disponibilidad : "Inmediata",
      salario_minimo: typeof parsed.salario_minimo === "number" ? parsed.salario_minimo : 0,
      salario_maximo: typeof parsed.salario_maximo === "number" ? parsed.salario_maximo : 0,
    };

    logger.info("Perfil de vacante generado exitosamente", { titulo: perfil.titulo });
    return perfil;
  } catch (error) {
    if (error.status) throw error;
    logger.error("Error generando perfil de vacante con Gemini:", error);
    throw createHttpError(502, `Error de Gemini API: ${error.message}`);
  }
}

// Notificar por email a candidatos con match >= 75%
export async function notificarCandidatosMatch(vacanteId) {
  try {
    const vacante = await getVacanteById(vacanteId);
    const [candidatos] = await pool.query(
      `SELECT vcs.score_total, u.email, u.nombre
       FROM vacante_candidato_score vcs
       JOIN candidatos c ON vcs.candidato_id = c.id
       JOIN usuarios u ON u.candidato_id = c.id
       WHERE vcs.vacante_id = ? AND vcs.score_total >= 50`,
      [vacanteId]
    );

    if (candidatos.length === 0) {
      logger.info(`No hay candidatos con match >= 75% para vacante ${vacanteId}`);
      return;
    }

    logger.info(`Enviando notificaciones a ${candidatos.length} candidatos para vacante ${vacanteId}`);

    for (const cand of candidatos) {
      try {
        await sendVacanteNotificationEmail({
          email: cand.email,
          nombre: cand.nombre,
          vacanteTitulo: vacante.titulo,
          vacanteCargo: vacante.cargo,
          vacanteCiudad: vacante.ciudad,
          score: cand.score_total,
        });
      } catch (err) {
        logger.warn(`Error enviando notificación a ${cand.email}: ${err.message}`);
      }
    }
  } catch (error) {
    logger.error(`Error notificando candidatos para vacante ${vacanteId}:`, error);
  }
}

// Obtener top candidatos para una vacante
export async function getTopCandidatesForVacante(vacanteId, limit = 10) {
  try {
    const [scores] = await pool.query(
      `SELECT 
        vcs.*, 
        c.nombre, c.ciudad, c.cargo, c.experiencia, 
        c.certificaciones, c.disponibilidad, c.jornada
       FROM vacante_candidato_score vcs
       JOIN candidatos c ON vcs.candidato_id = c.id
       WHERE vcs.vacante_id = ?
       ORDER BY vcs.score_total DESC
       LIMIT ?`,
      [vacanteId, limit]
    );

    return scores;
  } catch (error) {
    logger.error(`Error obteniendo candidatos para vacante ${vacanteId}:`, error);
    throw error;
  }
}

function calculateExperienceScore(candidateExp, minExp, maxExp) {
  if (!candidateExp) return 0;

  const exp = parseInt(candidateExp);
  if (exp < minExp) {
    return Math.max(0, (exp / minExp) * 100);
  }
  if (exp > maxExp) {
    return 100;
  }
  return 100;
}

function calculateCertificationsScore(candidateCerts, requiredCerts) {
  if (!candidateCerts || requiredCerts.length === 0) return 50;

  const candidateCertsArray = typeof candidateCerts === "string"
    ? candidateCerts.split(",").map((c) => c.trim().toLowerCase())
    : candidateCerts;

  const requiredCertsArray = Array.isArray(requiredCerts)
    ? requiredCerts.map((c) => c.toLowerCase())
    : [];

  if (requiredCertsArray.length === 0) return 80;

  const matches = requiredCertsArray.filter((req) =>
    candidateCertsArray.some((cand) => cand.includes(req) || req.includes(cand))
  ).length;

  return (matches / requiredCertsArray.length) * 100;
}

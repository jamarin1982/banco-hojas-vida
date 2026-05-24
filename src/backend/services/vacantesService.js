import { pool } from "../db.ts";
import { createHttpError } from "../utils/httpError.js";
import { logger } from "../utils/logger.js";
import { sendVacanteNotificationEmail, sendTestLinkEmail } from "../utils/mailer.js";
import { cacheInvalidate } from "../utils/cache.js";
import { mysqlNow } from "../utils/mysqlDate.js";
import {
  calculateExperienceScore,
  calculateCertificationsScore,
} from "./matchingService.ts";

export async function getAllVacantes(estado = null, page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM vacantes";
    const params = [];

    if (estado) {
      query += " WHERE estado = ?";
      params.push(estado);
    }

    query += " ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    let countQuery = "SELECT COUNT(*) as total FROM vacantes";
    const countParams = [];
    if (estado) {
      countQuery += " WHERE estado = ?";
      countParams.push(estado);
    }
    const [[{ total }]] = await pool.query(countQuery, countParams);

    return {
      data: rows.map((vacante) => ({
        ...vacante,
        certificaciones_requeridas: safeParseJson(vacante.certificaciones_requeridas),
        responsabilidades: safeParseJson(vacante.responsabilidades),
        requisitos: safeParseJson(vacante.requisitos),
        ofrecemos: safeParseJson(vacante.ofrecemos),
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error("Error obteniendo vacantes:", error);
    throw error;
  }
}

function safeParseJson(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
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
      certificaciones_requeridas: safeParseJson(vacante.certificaciones_requeridas),
      responsabilidades: safeParseJson(vacante.responsabilidades),
      requisitos: safeParseJson(vacante.requisitos),
      ofrecemos: safeParseJson(vacante.ofrecemos),
    };
  } catch (error) {
    logger.error(`Error obteniendo vacante ${id}:`, error);
    throw error;
  }
}

export async function createVacante(vacante) {
  try {
    const now = mysqlNow();
    const [result] = await pool.query(
      `INSERT INTO vacantes
       (titulo, descripcion, resumen, responsabilidades, requisitos, ofrecemos, cargo, ciudad, experiencia_minima, experiencia_maxima,
        certificaciones_requeridas, disponibilidad, jornada, salario_minimo, salario_maximo, test_link, estado,
        fecha_creacion, fecha_actualizacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        vacante.test_link || null,
        vacante.estado || "Activa",
        now,
        now,
      ]
    );

    logger.info(`Vacante creada: ${result.insertId}`);
    cacheInvalidate("dashboard:");
    return result.insertId;
  } catch (error) {
    logger.error("Error creando vacante:", error);
    throw error;
  }
}

export async function updateVacante(id, vacante) {
  try {
    const now = mysqlNow();
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
        test_link = ?,
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
        vacante.test_link || null,
        vacante.estado || "Activa",
        now,
        id,
      ]
    );

    logger.info(`Vacante actualizada: ${id}`);
    cacheInvalidate("dashboard:");
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
    cacheInvalidate("dashboard:");
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

    const now = mysqlNow();
    await pool.query(
      `INSERT INTO vacante_candidato_score (vacante_id, candidato_id, score_total, score_experiencia, score_certificaciones, score_ubicacion, score_disponibilidad, estado_aplicacion, fecha_score)
       VALUES (?, ?, 0, 0, 0, 0, 0, 'Aplicó', ?)`,
      [vacanteId, usuario.candidato_id, now]
    );

    logger.info(`Candidato ${usuario.candidato_id} postulado a vacante ${vacanteId}`);
    cacheInvalidate("dashboard:");
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
    const now = mysqlNow();
    const vacante = await getVacanteById(vacanteId);
    await pool.query(
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
    cacheInvalidate("dashboard:");
    return scores;
  } catch (error) {
    logger.error(`Error calculando matching scores:`, error);
    throw error;
  }
}

export async function calculateMatchingForCandidate(candidatoId) {
  try {
    const now = mysqlNow();
    const [[candidato]] = await pool.query("SELECT * FROM candidatos WHERE id = ?", [candidatoId]);
    if (!candidato) return 0;

    const [vacantes] = await pool.query("SELECT * FROM vacantes WHERE estado = 'Activa'");
    if (vacantes.length === 0) return 0;

    let scoresSaved = 0;
    for (const vacante of vacantes) {
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

      await pool.query(
        `INSERT INTO vacante_candidato_score
         (vacante_id, candidato_id, score_total, score_experiencia, score_certificaciones,
          score_ubicacion, score_disponibilidad, estado_aplicacion, fecha_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Sugerido', ?)
         ON DUPLICATE KEY UPDATE
         score_total = ?, score_experiencia = ?, score_certificaciones = ?,
         score_ubicacion = ?, score_disponibilidad = ?, fecha_score = ?`,
        [
          vacante.id, candidatoId, scoreTotal, scoreExperiencia, scoreCertificaciones,
          scoreUbicacion, scoreDisponibilidad, now,
          scoreTotal, scoreExperiencia, scoreCertificaciones,
          scoreUbicacion, scoreDisponibilidad, now,
        ]
      );
      scoresSaved++;
    }

    logger.info(`Matching calculado para candidato ${candidatoId} contra ${scoresSaved} vacantes activas`);
    cacheInvalidate("dashboard:");
    return scoresSaved;
  } catch (error) {
    logger.error(`Error calculando matching para candidato ${candidatoId}:`, error);
    return 0;
  }
}

export async function calculateMatchingWithAI(vacanteId) {
  try {
    const now = mysqlNow();
    const vacante = await getVacanteById(vacanteId);

    const [candidatos] = await pool.query(
      "SELECT * FROM candidatos WHERE estado IN ('Aplicó', 'Aprobado') ORDER BY id DESC"
    );

    if (candidatos.length === 0) {
      logger.info(`No hay candidatos para matching IA en vacante ${vacanteId}`);
      return [];
    }

    const vacanteInfo = `
TÍTULO: ${vacante.titulo}
CARGO: ${vacante.cargo}
CIUDAD: ${vacante.ciudad}
EXPERIENCIA REQUERIDA: ${vacante.experiencia_minima} a ${vacante.experiencia_maxima} años
CERTIFICACIONES REQUERIDAS: ${(vacante.certificaciones_requeridas || []).join(", ") || "Ninguna específica"}
DISPONIBILIDAD: ${vacante.disponibilidad}
JORNADA: ${vacante.jornada}
REQUISITOS: ${(vacante.requisitos || []).join("; ") || "No especificados"}
RESPONSABILIDADES: ${(vacante.responsabilidades || []).join("; ") || "No especificadas"}
OFRECEMOS: ${(vacante.ofrecemos || []).join("; ") || "No especificado"}
DESCRIPCIÓN: ${vacante.descripcion || "No disponible"}
RESUMEN: ${vacante.resumen || "No disponible"}
`.trim();

    const scores = [];

    for (const candidato of candidatos) {
      const candidatoInfo = `
NOMBRE: ${candidato.nombre}
CIUDAD: ${candidato.ciudad}
CARGO ACTUAL/DESEADO: ${candidato.cargo}
AÑOS DE EXPERIENCIA: ${candidato.experiencia}
CERTIFICACIONES: ${candidato.certificaciones || "Ninguna registrada"}
DISPONIBILIDAD: ${candidato.disponibilidad || "No especificada"}
JORNADA: ${candidato.jornada || "No especificada"}
OBSERVACIONES/RESUMEN CV: ${candidato.observaciones || "No disponible"}
`.trim();

      const prompt = `Eres un experto reclutador de talento humano. Evalúa qué tan bien coincide este candidato con la vacante.

VACANTE:
${vacanteInfo}

CANDIDATO:
${candidatoInfo}

Instrucciones:
1. Analiza TODA la información del candidato y compárala con los requisitos de la vacante.
2. Considera experiencia, certificaciones, ubicación, disponibilidad y el contenido del CV (observaciones).
3. Entiende sinónimos y contextos: "liderazgo de equipos" equivale a "manejo de grupos", "JavaScript" implica conocimiento de frameworks como React, etc.
4. Evalúa si la experiencia del candidato es relevante para las responsabilidades de la vacante.
5. Considera si las certificaciones del candidato cubren las requeridas (aunque usen nombres diferentes).

Responde ÚNICAMENTE con un JSON en este formato exacto, sin texto adicional:
{"score": número_entre_0_y_100, "justificacion": "breve explicación de 1-2 oraciones"}

Reglas:
- score: número entero entre 0 y 100
- justificacion: texto corto explicando por qué ese score
- No inventes información que no esté en los datos
- Sé objetivo y profesional`;

      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

        if (!GEMINI_API_KEY) {
          logger.warn("Gemini API key no configurada, omitiendo matching IA");
          continue;
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        logger.info(`Analizando candidato ${candidato.nombre} con IA para vacante ${vacanteId}`);
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
            logger.warn(`IA no devolvió JSON válido para candidato ${candidato.id}`);
            continue;
          }
          parsed = JSON.parse(match[0]);
        }

        const scoreTotal = Math.min(100, Math.max(0, Math.round(parsed.score || 0)));

        await pool.query(
          `INSERT INTO vacante_candidato_score
           (vacante_id, candidato_id, score_total, score_experiencia, score_certificaciones,
            score_ubicacion, score_disponibilidad, estado_aplicacion, fecha_score)
           VALUES (?, ?, ?, 0, 0, 0, 0, 'Sugerido IA', ?)
           ON DUPLICATE KEY UPDATE
           score_total = ?, estado_aplicacion = 'Sugerido IA', fecha_score = ?`,
          [vacanteId, candidato.id, scoreTotal, now, scoreTotal, now]
        );

        scores.push({
          candidatoId: candidato.id,
          scoreTotalValue: scoreTotal,
          justificacion: parsed.justificacion || "",
        });

        logger.info(`IA: ${candidato.nombre} → ${scoreTotal}% para vacante ${vacanteId}`);
      } catch (err) {
        logger.error(`Error IA para candidato ${candidato.id}:`, err.message);
      }
    }

    cacheInvalidate("dashboard:");
    logger.info(`Matching IA completado para vacante ${vacanteId}: ${scores.length} candidatos evaluados`);
    return scores;
  } catch (error) {
    logger.error(`Error en matching IA para vacante ${vacanteId}:`, error);
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
        WHERE vcs.vacante_id = ? AND vcs.score_total >= 70`,
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
        WHERE vcs.vacante_id = ? AND vcs.score_total >= 70
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

export async function enviarPruebaACandidato(candidatoId, vacanteId, testLink) {
  try {
    const [[candidato]] = await pool.query(
      "SELECT c.nombre, u.email FROM candidatos c JOIN usuarios u ON u.candidato_id = c.id WHERE c.id = ?",
      [candidatoId]
    );
    if (!candidato) throw new Error("Candidato no encontrado");

    const [[vacante]] = await pool.query(
      "SELECT titulo, test_link FROM vacantes WHERE id = ?",
      [vacanteId]
    );
    if (!vacante) throw new Error("Vacante no encontrada");

    const link = testLink || vacante.test_link || process.env.TEST_PLATFORM_URL || "https://forms.gle/default-test";

    await sendTestLinkEmail({
      email: candidato.email,
      nombre: candidato.nombre,
      vacanteTitulo: vacante.titulo,
      candidatoNombre: candidato.nombre,
      testLink: link,
    });

    logger.info(`Prueba enviada a candidato ${candidatoId} para vacante ${vacanteId}`);
    return true;
  } catch (error) {
    logger.error(`Error enviando prueba a candidato ${candidatoId}:`, error);
    throw error;
  }
}



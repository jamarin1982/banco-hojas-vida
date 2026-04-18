import { pool } from "../db.js";
import { createHttpError } from "../utils/httpError.js";
import { logger } from "../utils/logger.js";

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
    
    // Parsear JSON de certificaciones
    return rows.map((vacante) => ({
      ...vacante,
      certificaciones_requeridas: vacante.certificaciones_requeridas
        ? JSON.parse(vacante.certificaciones_requeridas)
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
       (titulo, descripcion, cargo, ciudad, experiencia_minima, experiencia_maxima,
        certificaciones_requeridas, disponibilidad, jornada, salario_minimo, salario_maximo, estado,
        fecha_creacion, fecha_actualizacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vacante.titulo,
        vacante.descripcion || null,
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

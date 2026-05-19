import { pool } from "../db.ts";
import { analyzeCv } from "../utils/cvAnalyzer.js";
import { createHttpError } from "../utils/httpError.js";
import { readCvPdf } from "../utils/readCvPdf.js";
import { cacheInvalidate } from "../utils/cache.js";
import { logger } from "../utils/logger.js";
import { calculateMatchingForCandidate } from "./vacantesService.js";

export async function getAllCandidates(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(`
    SELECT c.*, 
      CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END as tiene_usuario
    FROM candidatos c
    LEFT JOIN usuarios u ON u.candidato_id = c.id
    ORDER BY c.id DESC
    LIMIT ? OFFSET ?
  `, [limit, offset]);

  const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM candidatos");

  return {
    data: rows,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
}

export async function createCandidate(candidate) {
  const [result] = await pool.query(
    `INSERT INTO candidatos
     (nombre, ciudad, cargo, experiencia, certificaciones, disponibilidad, jornada, aspiracion, estado, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      candidate.nombre,
      candidate.ciudad,
      candidate.cargo,
      candidate.experiencia,
      candidate.certificaciones,
      candidate.disponibilidad,
      candidate.jornada,
      candidate.aspiracion,
      candidate.estado,
      candidate.observaciones,
    ]
  );

  cacheInvalidate("dashboard:");
  const candidateId = result.insertId;
  calculateMatchingForCandidate(candidateId).catch((err) => {
    logger.warn(`Error calculando matching para nuevo candidato ${candidateId}:`, err.message);
  });
  return candidateId;
}

export async function updateCandidate(id, candidate) {
  await pool.query(
    `UPDATE candidatos SET
      nombre = ?,
      ciudad = ?,
      cargo = ?,
      experiencia = ?,
      certificaciones = ?,
      disponibilidad = ?,
      jornada = ?,
      aspiracion = ?,
      estado = ?,
      observaciones = ?
     WHERE id = ?`,
    [
      candidate.nombre,
      candidate.ciudad,
      candidate.cargo,
      candidate.experiencia,
      candidate.certificaciones,
      candidate.disponibilidad,
      candidate.jornada,
      candidate.aspiracion,
      candidate.estado,
      candidate.observaciones,
      id,
    ]
  );
  cacheInvalidate("dashboard:");
}

export async function deleteCandidate(id) {
  await pool.query("DELETE FROM candidatos WHERE id = ?", [id]);
  cacheInvalidate("dashboard:");
}

export async function updateCandidateCvPath(id, cvPath) {
  await pool.query("UPDATE candidatos SET cv_path = ? WHERE id = ?", [cvPath, id]);
  cacheInvalidate("dashboard:");
}

export async function analyzeCandidateCv(id) {
  const [[candidate]] = await pool.query("SELECT cv_path FROM candidatos WHERE id = ?", [id]);

  if (!candidate || !candidate.cv_path) {
    throw createHttpError(400, "El candidato no tiene CV");
  }

  const text = await readCvPdf(candidate.cv_path);
  return analyzeCv(text);
}

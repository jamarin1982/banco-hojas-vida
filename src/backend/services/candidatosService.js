import { pool } from "../db.js";
import { analyzeCv } from "../utils/cvAnalyzer.js";
import { createHttpError } from "../utils/httpError.js";
import { readCvPdf } from "../utils/readCvPdf.js";

export async function getAllCandidates() {
  const [rows] = await pool.query(`
    SELECT c.*, 
      CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END as tiene_usuario
    FROM candidatos c
    LEFT JOIN usuarios u ON u.candidato_id = c.id
    ORDER BY c.id DESC
  `);
  return rows;
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

  return result.insertId;
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
}

export async function deleteCandidate(id) {
  await pool.query("DELETE FROM candidatos WHERE id = ?", [id]);
}

export async function updateCandidateCvPath(id, cvPath) {
  await pool.query("UPDATE candidatos SET cv_path = ? WHERE id = ?", [cvPath, id]);
}

export async function analyzeCandidateCv(id) {
  const [[candidate]] = await pool.query("SELECT cv_path FROM candidatos WHERE id = ?", [id]);

  if (!candidate || !candidate.cv_path) {
    throw createHttpError(400, "El candidato no tiene CV");
  }

  const text = await readCvPdf(candidate.cv_path);
  return analyzeCv(text);
}

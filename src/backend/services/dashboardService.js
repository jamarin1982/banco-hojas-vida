import { pool } from "../db.js";
import { logger } from "../utils/logger.js";

export async function getDashboardStats() {
  try {
    // 1. Total Candidatos
    const [[candTotal]] = await pool.query("SELECT COUNT(*) as total FROM candidatos");

    // 2. Disponibles Inmediatos
    const [[candInmediatos]] = await pool.query(
      "SELECT COUNT(*) as total FROM candidatos WHERE disponibilidad = 'Inmediata'"
    );

    // 3. Aprobados / En Proceso (Estados: Aprobado, Contratado)
    const [[candAprobados]] = await pool.query(
      "SELECT COUNT(*) as total FROM candidatos WHERE estado IN ('Aprobado', 'Contratado')"
    );

    // 4. Score Promedio Real (de la tabla de matching)
    const [[avgScore]] = await pool.query(
      "SELECT AVG(score_total) as promedio FROM vacante_candidato_score WHERE score_total > 0"
    );

    // 5. Vacantes Activas
    const [[vacActivas]] = await pool.query(
      "SELECT COUNT(*) as total FROM vacantes WHERE estado = 'Activa'"
    );

    // 6. Vacantes sin postulantes (Activas con 0 aplicaciones)
    const [[vacSinPostulantes]] = await pool.query(
      `SELECT COUNT(*) as total FROM vacantes v 
       LEFT JOIN vacante_candidato_score vcs ON v.id = vcs.vacante_id 
       WHERE v.estado = 'Activa' AND vcs.vacante_id IS NULL`
    );

    // 7. Nuevas aplicaciones (últimos 7 días)
    const [[appsRecientes]] = await pool.query(
      "SELECT COUNT(*) as total FROM vacante_candidato_score WHERE fecha_score >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );

    return {
      totalCandidatos: candTotal.total || 0,
      inmediatos: candInmediatos.total || 0,
      aprobados: candAprobados.total || 0,
      scorePromedio: Math.round(avgScore.promedio || 0),
      vacantesActivas: vacActivas.total || 0,
      vacantesSinPostulantes: vacSinPostulantes.total || 0,
      aplicacionesRecientes: appsRecientes.total || 0,
    };
  } catch (error) {
    logger.error("Error obteniendo stats del dashboard:", error);
    throw error;
  }
}

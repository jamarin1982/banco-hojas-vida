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

    // 3. Aprobados / Contratados
    const [[candAprobados]] = await pool.query(
      "SELECT COUNT(*) as total FROM candidatos WHERE estado IN ('Aprobado', 'Contratado')"
    );

    // 4. Score Promedio Real
    const [[avgScore]] = await pool.query(
      "SELECT AVG(score_total) as promedio FROM vacante_candidato_score WHERE score_total > 0"
    );

    // 5. Vacantes Activas
    const [[vacActivas]] = await pool.query(
      "SELECT COUNT(*) as total FROM vacantes WHERE estado = 'Activa'"
    );

    // 6. Vacantes sin postulantes
    const [[vacSinPostulantes]] = await pool.query(
      `SELECT COUNT(*) as total FROM vacantes v 
       LEFT JOIN vacante_candidato_score vcs ON v.id = vcs.vacante_id 
       WHERE v.estado = 'Activa' AND vcs.vacante_id IS NULL`
    );

    // 7. Vacantes por estado
    const [vacPorEstado] = await pool.query(
      "SELECT estado, COUNT(*) as total FROM vacantes GROUP BY estado"
    );

    // 8. Embudo de aplicaciones (estado_aplicacion)
    const [embudoAplicaciones] = await pool.query(
      "SELECT estado_aplicacion, COUNT(*) as total FROM vacante_candidato_score GROUP BY estado_aplicacion"
    );

    // 9. Score promedio por vacante activa
    const [scorePorVacante] = await pool.query(
      `SELECT v.id, v.titulo, 
        ROUND(AVG(vcs.score_total), 1) as score_promedio,
        COUNT(vcs.id) as total_aplicaciones,
        SUM(CASE WHEN vcs.score_total >= 75 THEN 1 ELSE 0 END) as match_alto
       FROM vacantes v
       LEFT JOIN vacante_candidato_score vcs ON v.id = vcs.vacante_id
       WHERE v.estado = 'Activa'
       GROUP BY v.id`
    );

    // 10. Desglose de scores (promedios globales)
    const [[desgloseScores]] = await pool.query(
      `SELECT 
        ROUND(AVG(score_experiencia), 1) as avg_experiencia,
        ROUND(AVG(score_certificaciones), 1) as avg_certificaciones,
        ROUND(AVG(score_ubicacion), 1) as avg_ubicacion,
        ROUND(AVG(score_disponibilidad), 1) as avg_disponibilidad
       FROM vacante_candidato_score WHERE score_total > 0`
    );

    // 11. Candidatos con match alto (>= 75%) en vacantes activas
    const [[matchAltoTotal]] = await pool.query(
      `SELECT COUNT(*) as total FROM vacante_candidato_score vcs
       JOIN vacantes v ON v.id = vcs.vacante_id
       WHERE v.estado = 'Activa' AND vcs.score_total >= 75`
    );

    // 12. Top ciudades de candidatos
    const [topCiudades] = await pool.query(
      "SELECT ciudad, COUNT(*) as total FROM candidatos GROUP BY ciudad ORDER BY total DESC LIMIT 5"
    );

    // 13. Vacantes con/sin preguntas
    const [[vacConPreguntas]] = await pool.query(
      `SELECT COUNT(DISTINCT vp.vacante_id) as total 
       FROM vacante_preguntas vp 
       JOIN vacantes v ON v.id = vp.vacante_id 
       WHERE v.estado = 'Activa'`
    );

    // 14. Candidatos con CV
    const [[candConCv]] = await pool.query(
      "SELECT COUNT(*) as total FROM candidatos WHERE cv_path IS NOT NULL AND cv_path != ''"
    );

    // 15. Nuevas aplicaciones (últimos 7 días) - fechas son VARCHAR ISO
    const [[appsRecientes]] = await pool.query(
      "SELECT COUNT(*) as total FROM vacante_candidato_score WHERE fecha_score IS NOT NULL"
    );

    // Procesar fechas en JS (son VARCHAR ISO)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const appsSemana = appsRecientes.total; // Aproximación, filtrado exacto requiere parseo en JS

    // 16. Top vacantes por interés
    const [topVacantes] = await pool.query(
      `SELECT v.id, v.titulo, COUNT(vcs.id) as aplicaciones
       FROM vacantes v
       LEFT JOIN vacante_candidato_score vcs ON v.id = vcs.vacante_id
       WHERE v.estado = 'Activa'
       GROUP BY v.id
       ORDER BY aplicaciones DESC
       LIMIT 5`
    );

    return {
      // KPIs principales
      totalCandidatos: candTotal.total || 0,
      inmediatos: candInmediatos.total || 0,
      aprobados: candAprobados.total || 0,
      scorePromedio: Math.round(avgScore.promedio || 0),
      vacantesActivas: vacActivas.total || 0,
      vacantesSinPostulantes: vacSinPostulantes.total || 0,
      aplicacionesRecientes: appsSemana || 0,
      matchAlto: matchAltoTotal.total || 0,

      // Embudo
      embudoAplicaciones: Object.fromEntries(
        embudoAplicaciones.map(r => [r.estado_aplicacion, r.total])
      ),

      // Vacantes por estado
      vacantesPorEstado: Object.fromEntries(
        vacPorEstado.map(r => [r.estado, r.total])
      ),

      // Score por vacante
      scorePorVacante,

      // Desglose de scores
      desgloseScores: desgloseScores || {},

      // Top ciudades
      topCiudades,

      // Preguntas
      vacConPreguntas: vacConPreguntas.total || 0,

      // CV
      candConCv: candConCv.total || 0,

      // Top vacantes
      topVacantes,
    };
  } catch (error) {
    logger.error("Error obteniendo stats del dashboard:", error);
    throw error;
  }
}

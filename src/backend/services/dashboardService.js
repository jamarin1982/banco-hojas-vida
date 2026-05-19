import { pool } from "../db.ts";
import { logger } from "../utils/logger.js";
import { cacheGet, cacheSet } from "../utils/cache.js";

const DASHBOARD_TTL = 5 * 60 * 1000;
const MATCHES_TTL = 10 * 60 * 1000;

export async function getDashboardStats() {
  try {
    const cached = cacheGet("dashboard:stats");
    if (cached && cached.totalCandidatos > 0) return cached;

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
       WHERE v.estado = 'Activa' AND vcs.score_total >= 70`
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

    // 17. Mejor match por candidato (contra vacantes activas)
    const [mejorMatchPorCandidato] = await pool.query(
      `SELECT vcs.candidato_id, 
        MAX(vcs.score_total) as mejor_match,
        ANY_VALUE(v.id) as vacante_id,
        ANY_VALUE(v.titulo) as vacante_titulo
       FROM vacante_candidato_score vcs
       JOIN vacantes v ON v.id = vcs.vacante_id
       WHERE v.estado = 'Activa'
       GROUP BY vcs.candidato_id`
    );

    const stats = {
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

      // Mejor match por candidato
      mejorMatchPorCandidato: Object.fromEntries(
        mejorMatchPorCandidato.map(r => [r.candidato_id, { score: Math.round(r.mejor_match), vacante: r.vacante_titulo }])
      ),
    };

    cacheSet("dashboard:stats", stats, DASHBOARD_TTL);
    return stats;
  } catch (error) {
    logger.error("Error obteniendo stats del dashboard:", error);
    throw error;
  }
}

export async function getCandidateMatches() {
  try {
    const cached = cacheGet("dashboard:matches");
    if (cached && Object.keys(cached).length > 0) return cached;

    const [matches] = await pool.query(
      `SELECT vcs.candidato_id, 
        MAX(vcs.score_total) as mejor_match,
        ANY_VALUE(v.id) as vacante_id,
        ANY_VALUE(v.titulo) as vacante_titulo
       FROM vacante_candidato_score vcs
       JOIN vacantes v ON v.id = vcs.vacante_id
       WHERE v.estado = 'Activa'
       GROUP BY vcs.candidato_id`
    );
    const result = Object.fromEntries(
      matches.map(r => [r.candidato_id, { score: Math.round(r.mejor_match), vacanteId: r.vacante_id, vacante: r.vacante_titulo }])
    );

    if (Object.keys(result).length > 0) {
      cacheSet("dashboard:matches", result, MATCHES_TTL);
    }
    return result;
  } catch (error) {
    logger.error("Error obteniendo matches de candidatos:", error);
    throw error;
  }
}

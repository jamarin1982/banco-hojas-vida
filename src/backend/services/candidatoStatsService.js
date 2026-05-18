import { pool } from "../db.js";
import { logger } from "../utils/logger.js";

export async function getCandidatoStats(usuarioId) {
  try {
    // 1. Obtener candidato_id del usuario
    const [[userRow]] = await pool.query(
      "SELECT candidato_id FROM usuarios WHERE id = ?",
      [usuarioId]
    );
    if (!userRow || !userRow.candidato_id) {
      return {
        aplicacionesTotales: 0,
        aplicacionesActivas: 0,
        aplicacionesCerradas: 0,
        mejorMatch: 0,
        matchPromedio: 0,
        perfilCompleto: 0,
        vacantesRecomendadas: 0,
        ultimaActividad: null,
        embudoAplicaciones: {},
      };
    }

    const candidatoId = userRow.candidato_id;

    // 2. Aplicaciones totales
    const [[appsTotales]] = await pool.query(
      "SELECT COUNT(*) as total FROM vacante_candidato_score WHERE candidato_id = ?",
      [candidatoId]
    );

    // 3. Aplicaciones en vacantes activas
    const [[appsActivas]] = await pool.query(
      `SELECT COUNT(*) as total FROM vacante_candidato_score vcs
       JOIN vacantes v ON v.id = vcs.vacante_id
       WHERE vcs.candidato_id = ? AND v.estado = 'Activa'`,
      [candidatoId]
    );

    // 4. Aplicaciones en vacantes cerradas/en revision
    const [[appsCerradas]] = await pool.query(
      `SELECT COUNT(*) as total FROM vacante_candidato_score vcs
       JOIN vacantes v ON v.id = vcs.vacante_id
       WHERE vcs.candidato_id = ? AND v.estado IN ('Cerrada', 'En revisión')`,
      [candidatoId]
    );

    // 5. Mejor match
    const [[mejorMatch]] = await pool.query(
      "SELECT MAX(score_total) as max_score FROM vacante_candidato_score WHERE candidato_id = ?",
      [candidatoId]
    );

    // 6. Match promedio
    const [[matchPromedio]] = await pool.query(
      "SELECT AVG(score_total) as avg_score FROM vacante_candidato_score WHERE candidato_id = ? AND score_total > 0",
      [candidatoId]
    );

    // 7. Embudo de aplicaciones
    const [embudo] = await pool.query(
      "SELECT estado_aplicacion, COUNT(*) as total FROM vacante_candidato_score WHERE candidato_id = ? GROUP BY estado_aplicacion",
      [candidatoId]
    );

    // 8. Última actividad
    const [[ultimaAct]] = await pool.query(
      "SELECT MAX(fecha_score) as ultima FROM vacante_candidato_score WHERE candidato_id = ?",
      [candidatoId]
    );

    // 9. Perfil del candidato (para completitud y recomendaciones)
    const [[perfil]] = await pool.query(
      "SELECT nombre, ciudad, cargo, experiencia, certificaciones, disponibilidad, jornada, cv_path FROM candidatos WHERE id = ?",
      [candidatoId]
    );

    // Calcular perfil completo
    const perfilCompleto = calcularPerfilCompleto(perfil);

    // 10. Vacantes recomendadas (activas, misma ciudad o cargo, no aplicadas)
    const [[vacsRecomendadas]] = await pool.query(
      `SELECT COUNT(*) as total FROM vacantes v
       LEFT JOIN vacante_candidato_score vcs ON v.id = vcs.vacante_id AND vcs.candidato_id = ?
       WHERE v.estado = 'Activa'
         AND vcs.vacante_id IS NULL
         AND (v.ciudad = ? OR v.cargo = ?)`,
      [candidatoId, perfil?.ciudad || "", perfil?.cargo || ""]
    );

    return {
      aplicacionesTotales: appsTotales.total || 0,
      aplicacionesActivas: appsActivas.total || 0,
      aplicacionesCerradas: appsCerradas.total || 0,
      mejorMatch: Math.round(mejorMatch.max_score || 0),
      matchPromedio: Math.round(matchPromedio.avg_score || 0),
      perfilCompleto,
      vacantesRecomendadas: vacsRecomendadas.total || 0,
      ultimaActividad: ultimaAct.ultima || null,
      embudoAplicaciones: Object.fromEntries(
        embudo.map(r => [r.estado_aplicacion, r.total])
      ),
    };
  } catch (error) {
    logger.error("Error obteniendo stats del candidato:", error);
    throw error;
  }
}

function calcularPerfilCompleto(perfil) {
  if (!perfil) return 0;

  const campos = [
    perfil.nombre && perfil.nombre.trim() && perfil.nombre !== "Por definir",
    perfil.ciudad && perfil.ciudad.trim() && perfil.ciudad !== "Por definir",
    perfil.cargo && perfil.cargo.trim() && perfil.cargo !== "Por definir",
    typeof perfil.experiencia === "number" || (perfil.experiencia !== null && perfil.experiencia !== undefined && perfil.experiencia !== ""),
    perfil.certificaciones && (
      (Array.isArray(perfil.certificaciones) && perfil.certificaciones.length > 0) ||
      (typeof perfil.certificaciones === "string" && perfil.certificaciones.trim().length > 0)
    ),
    perfil.disponibilidad && perfil.disponibilidad.trim() !== "",
    perfil.jornada && perfil.jornada.trim() !== "",
    perfil.cv_path && perfil.cv_path.trim() !== "",
  ];

  const llenos = campos.filter(Boolean).length;
  return Math.round((llenos / campos.length) * 100);
}

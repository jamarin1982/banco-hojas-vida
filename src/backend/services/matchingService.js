export function calculateExperienceScore(candidateExp, minExp, maxExp) {
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

export function calculateCertificationsScore(candidateCerts, requiredCerts) {
  if (!candidateCerts || requiredCerts.length === 0) return 50;

  const candidateCertsArray = typeof candidateCerts === "string"
    ? candidateCerts.split(",").map((c) => c.trim().toLowerCase())
    : candidateCerts.map((c) => c.toLowerCase());

  const requiredCertsArray = Array.isArray(requiredCerts)
    ? requiredCerts.map((c) => c.toLowerCase())
    : [];

  if (requiredCertsArray.length === 0) return 80;

  const matches = requiredCertsArray.filter((req) =>
    candidateCertsArray.some((cand) => cand.includes(req) || req.includes(cand))
  ).length;

  return (matches / requiredCertsArray.length) * 100;
}

export function calculateUbicacionScore(candidateCity, vacanteCity) {
  return candidateCity === vacanteCity ? 100 : 40;
}

export function calculateDisponibilidadScore(candidateDisp, vacanteDisp) {
  return candidateDisp === vacanteDisp ? 100 : 70;
}

export function calculateTotalScore(scoreExperiencia, scoreCertificaciones, scoreUbicacion, scoreDisponibilidad) {
  return Math.round(
    scoreExperiencia * 0.35 +
    scoreCertificaciones * 0.35 +
    scoreUbicacion * 0.15 +
    scoreDisponibilidad * 0.15
  );
}

export function calculateFullMatching(candidate, vacante) {
  const scoreExperiencia = calculateExperienceScore(
    candidate.experiencia,
    vacante.experiencia_minima,
    vacante.experiencia_maxima
  );

  const scoreCertificaciones = calculateCertificationsScore(
    candidate.certificaciones || "",
    vacante.certificaciones_requeridas || []
  );

  const scoreUbicacion = calculateUbicacionScore(candidate.ciudad, vacante.ciudad);
  const scoreDisponibilidad = calculateDisponibilidadScore(candidate.disponibilidad, vacante.disponibilidad);

  const scoreTotal = calculateTotalScore(scoreExperiencia, scoreCertificaciones, scoreUbicacion, scoreDisponibilidad);

  return {
    scoreTotal,
    scoreExperiencia,
    scoreCertificaciones,
    scoreUbicacion,
    scoreDisponibilidad,
  };
}

export interface Candidate {
  experiencia: number | string;
  certificaciones: string | string[];
  ciudad: string;
  disponibilidad: string;
}

export interface Vacante {
  experiencia_minima: number;
  experiencia_maxima: number;
  certificaciones_requeridas: string[];
  ciudad: string;
  disponibilidad: string;
}

export interface MatchingResult {
  scoreTotal: number;
  scoreExperiencia: number;
  scoreCertificaciones: number;
  scoreUbicacion: number;
  scoreDisponibilidad: number;
}

export function calculateExperienceScore(
  candidateExp: number | string | null | undefined,
  minExp: number,
  maxExp: number
): number {
  if (!candidateExp) return 0;

  const exp = parseInt(String(candidateExp), 10);
  if (exp < minExp) {
    return Math.max(0, (exp / minExp) * 100);
  }
  if (exp > maxExp) {
    return 100;
  }
  return 100;
}

export function calculateCertificationsScore(
  candidateCerts: string | string[] | null | undefined,
  requiredCerts: string[]
): number {
  if (!candidateCerts || requiredCerts.length === 0) return 50;

  const candidateCertsArray = typeof candidateCerts === "string"
    ? candidateCerts.split(",").map((c) => c.trim().toLowerCase())
    : candidateCerts.map((c) => c.toLowerCase());

  const requiredCertsArray = requiredCerts.map((c) => c.toLowerCase());

  if (requiredCertsArray.length === 0) return 80;

  const matches = requiredCertsArray.filter((req) =>
    candidateCertsArray.some((cand) => cand.includes(req) || req.includes(cand))
  ).length;

  return (matches / requiredCertsArray.length) * 100;
}

export function calculateUbicacionScore(candidateCity: string, vacanteCity: string): number {
  return candidateCity === vacanteCity ? 100 : 40;
}

export function calculateDisponibilidadScore(candidateDisp: string, vacanteDisp: string): number {
  return candidateDisp === vacanteDisp ? 100 : 70;
}

export function calculateTotalScore(
  scoreExperiencia: number,
  scoreCertificaciones: number,
  scoreUbicacion: number,
  scoreDisponibilidad: number
): number {
  return Math.round(
    scoreExperiencia * 0.35 +
    scoreCertificaciones * 0.35 +
    scoreUbicacion * 0.15 +
    scoreDisponibilidad * 0.15
  );
}

export function calculateFullMatching(candidate: Candidate, vacante: Vacante): MatchingResult {
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

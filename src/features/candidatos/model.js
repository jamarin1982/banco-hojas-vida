export const EMPTY_CANDIDATE_FORM = {
  nombre: "",
  ciudad: "",
  cargo: "",
  experiencia: "",
  certificaciones: "",
  disponibilidad: "",
  jornada: "",
  aspiracion: "",
  observaciones: "",
  cv: null,
};

export const VACANTE_DEMO = {
  cargo: "Operaria de aseo",
  ciudad: "Bogotá",
  experienciaMin: 2,
  certRequeridas: ["Aseo hospitalario"],
  disponibilidad: "Inmediata",
  jornada: "Nocturna",
};

export function scoreCandidate(candidate) {
  let score = 40;
  if (candidate.cargo === VACANTE_DEMO.cargo) score += 20;
  if (candidate.ciudad === VACANTE_DEMO.ciudad) score += 10;
  if (candidate.experiencia >= VACANTE_DEMO.experienciaMin) score += 10;
  if (candidate.certificaciones.some((item) => VACANTE_DEMO.certRequeridas.includes(item))) score += 10;
  if (candidate.disponibilidad === VACANTE_DEMO.disponibilidad) score += 5;
  if (candidate.jornada === VACANTE_DEMO.jornada) score += 5;
  return Math.min(score, 100);
}

export function statusColor(estado) {
  switch (estado) {
    case "Aplicó":
      return "bg-slate-100 text-slate-700";
    case "Preseleccionado":
      return "bg-blue-100 text-blue-700";
    case "Entrevista":
      return "bg-amber-100 text-amber-700";
    case "Aprobado":
      return "bg-green-100 text-green-700";
    case "Contratado":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

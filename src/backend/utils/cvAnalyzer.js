/**
 * CV Parser sin IA - Extrae datos usando regex
 * Rápido: ~500ms, Local, Gratis, Sin dependencias
 */

import { createHttpError } from "./httpError.js";
import { logger } from "./logger.js";

/**
 * Patrones regex para extraer información de CVs
 */
const PATTERNS = {
  // Nombres - línea corta al inicio
  nombre: /^([A-ZÁÉÍÓÚa-záéíóú]{2,}\s+[A-ZÁÉÍÓÚa-záéíóú]{2,}(?:\s+[A-ZÁÉÍÓÚa-záéíóú]{2,})?)/m,

  // Ciudades comunes Colombia
  ciudad:
    /(?:bogotá|medellín|cali|barranquilla|cartagena|bucaramanga|cúcuta|manizales|palmira|montería|pasto|ibagué|villavicencio|pereira|santa marta|valledupar|arequipa|buenos aires|mexico|madrid|barcelona|bogota|medellin|sin ciudad|en el país|en colombia)/i,

  // Cargos - palabras clave
  cargo:
    /(?:desarrollador|programador|ingeniero|analista|diseñador|gerente|director|coordinador|jefe|especialista|consultor|ejecutivo|asistente|contador|abogado|vendedor|técnico|intérprete|jefe de|head of|sr\.|jr\.|senior|junior|full\s?stack|backend|frontend|devops|qa|tester)/i,

  // Años de experiencia
  experiencia: /(\d+)\s*(?:años|años de experiencia|exp|años en|years)/i,

  // Certificaciones - patrones comunes
  certificaciones: {
    aws: /AWS|Amazon Web Services|Certified|certification/i,
    azure: /Azure|Microsoft Azure/i,
    gcp: /Google Cloud|GCP/i,
    scrum: /Scrum Master|Product Owner|CSM|CSPO/i,
    kubernetes: /Kubernetes|K8s|Docker/i,
    java: /Java|Spring|J2EE/i,
    python: /Python|Django|FastAPI|Flask/i,
    javascript: /JavaScript|TypeScript|Node\.?js|React|Vue|Angular/i,
    sql: /SQL|MySQL|PostgreSQL|Oracle|MSSQL|T-SQL/i,
    web: /HTML|CSS|Web|Frontend/i,
    mobile: /Mobile|iOS|Android|Flutter|React Native/i,
    devops: /DevOps|CI\/CD|Jenkins|GitLab|GitHub Actions/i,
    agile: /Agile|kanban|Jira|XP|Extreme Programming/i,
  },
};

/**
 * Extrae el nombre del candidato
 */
function extractNombre(text) {
  const lines = text.split("\n");
  
  for (const line of lines.slice(0, 5)) {
    const cleaned = line.trim();
    // Saltarse líneas de email, teléfono, etc
    if (
      cleaned.includes("@") ||
      cleaned.includes("+") ||
      cleaned.length > 100 ||
      cleaned.length < 5
    ) {
      continue;
    }

    // Si empieza con mayúsculas, probablemente es el nombre
    const match = cleaned.match(
      /^([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+){1,2})/
    );
    if (match) {
      return match[1].trim();
    }
  }

  return "Candidato";
}

/**
 * Extrae la ciudad
 */
function extractCiudad(text) {
  const match = text.match(PATTERNS.ciudad);
  if (match) {
    const ciudad = match[0];
    return ciudad.charAt(0).toUpperCase() + ciudad.slice(1).toLowerCase();
  }
  return "No especificada";
}

/**
 * Extrae el cargo
 */
function extractCargo(text) {
  // Buscar línea con palabra clave de cargo
  const lines = text.split("\n");
  
  for (const line of lines.slice(0, 20)) {
    if (PATTERNS.cargo.test(line)) {
      // Extraer solo la palabra del cargo
      const match = line.match(PATTERNS.cargo);
      if (match) {
        return match[0].trim();
      }
    }
  }

  return "Sin especificar";
}

/**
 * Extrae años de experiencia calculando desde fecha más antigua hasta hoy
 * DESCARTA fechas de nacimiento y busca contexto laboral
 */
function extractExperiencia(text) {
  // Palabras clave que indican contexto laboral
  const laborKeywords = /(?:desde|trabajé|trabajo|empresa|puesto|cargo|experiencia|laboral|profesional|desempeño|posición|Role|Position|Employment|Empresa|Compañía|Socio|Director|Gerente|Jefe|Coordinador|Especialista|Consultor|Analista|Desarrollador|Ingeniero|Manager|Lead|Senior|Junior)/i;

  // Patrones de fechas con contexto
  const dateContextPatterns = [
    // "desde enero 2010" o "desde 2010"
    /\bdesde\s+(?:(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+)?(19\d{2}|20\d{2})/gi,
    // "2010 - 2015" o "2010-presente"
    /(19\d{2}|20\d{2})\s*[-–]\s*(?:presente|actualidad|ahora|current|2026)/gi,
    // Contexto: "En 2015 comencé como..." o similar
    /(?:en|from|en el año|en año)\s+(19\d{2}|20\d{2})\s+(?:comencé|empecé|trabaje|trabajé|como|in|at)/gi,
  ];

  let workStartYear = null;

  // Buscar fechas con contexto laboral explícito
  for (const pattern of dateContextPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      // Extraer año
      const yearMatch = match[0].match(/(19\d{2}|20\d{2})/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0], 10);
        
        // Descartar fechas de nacimiento (antes de 1990 es muy antiguo para experiencia laboral moderna)
        // y fechas futuras
        if (year >= 1990 && year <= new Date().getFullYear()) {
          if (!workStartYear || year < workStartYear) {
            workStartYear = year;
          }
        }
      }
    }
  }

  // Si no encontramos con contexto explícito, buscar años sueltos pero más recientes
  if (!workStartYear) {
    const allYears = [];
    const yearPattern = /\b(19\d{2}|20\d{2})\b/g;
    let match;
    
    while ((match = yearPattern.exec(text)) !== null) {
      const year = parseInt(match[1], 10);
      // Solo considerar años recientes (1990 en adelante, descartando nacimiento)
      if (year >= 1990 && year <= new Date().getFullYear()) {
        allYears.push(year);
      }
    }

    // Tomar el año más antiguo de los años recientes
    if (allYears.length > 0) {
      workStartYear = Math.min(...allYears);
    }
  }

  // Si encontramos una fecha, calcular años hasta hoy
  if (workStartYear) {
    const currentYear = new Date().getFullYear();
    const experiencia = currentYear - workStartYear;
    return Math.max(0, Math.min(experiencia, 60)); // Max 60 años (sanity check)
  }

  // Fallback: intentar encontrar número directo mencionado
  const numberMatch = text.match(/(\d+)\s*(?:años|años de experiencia|exp|years|año)/i);
  if (numberMatch && numberMatch[1]) {
    const years = parseInt(numberMatch[1], 10);
    return years > 0 && years < 60 ? years : 0;
  }

  return 0;
}

/**
 * Extrae certificaciones basadas en palabras clave
 */
function extractCertificaciones(text) {
  const certs = [];
  const textLower = text.toLowerCase();

  for (const [cert, pattern] of Object.entries(PATTERNS.certificaciones)) {
    if (pattern.test(text)) {
      // Mapear a nombres mostrable
      const certNames = {
        aws: "AWS",
        azure: "Azure",
        gcp: "Google Cloud",
        scrum: "Scrum Master",
        kubernetes: "Kubernetes",
        java: "Java",
        python: "Python",
        javascript: "JavaScript",
        sql: "SQL",
        web: "Web Development",
        mobile: "Mobile Development",
        devops: "DevOps",
        agile: "Agile",
      };
      certs.push(certNames[cert]);
    }
  }

  return [...new Set(certs)]; // Remover duplicados
}

/**
 * Genera un resumen del CV
 */
function extractResumen(text) {
  // Tomar primeras líneas después del nombre/contacto
  const lines = text.split("\n").filter((l) => l.trim().length > 10 && l.length < 200);
  
  const resumen = lines
    .slice(2, 5)
    .map((l) => l.trim())
    .filter((l) => !l.includes("@") && !l.includes("+"))
    .join(" ");

  return resumen.slice(0, 200) || "Sin descripción disponible";
}

/**
 * Analiza CV y extrae datos sin IA
 * @param {string} text - Contenido del CV en texto
 * @returns {Promise<Object>} Datos extraídos
 */
export async function analyzeCv(text) {
  if (!text || text.length < 50) {
    throw createHttpError(400, "CV muy corto para analizar");
  }

  try {
    logger.info("Analizando CV con parser regex (sin IA)");

    const resultado = {
      nombre: extractNombre(text),
      cargo: extractCargo(text),
      experiencia: extractExperiencia(text),
      ciudad: extractCiudad(text),
      certificaciones: extractCertificaciones(text),
      resumen: extractResumen(text),
    };

    logger.info("CV analizado exitosamente", resultado);
    return resultado;
  } catch (error) {
    logger.error("Error analizando CV", { error: error.message });
    throw createHttpError(
      502,
      "Error procesando CV: " + error.message
    );
  }
}

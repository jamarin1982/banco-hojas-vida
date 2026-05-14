import { GoogleGenerativeAI } from "@google/generative-ai";
import { createHttpError } from "./httpError.js";
import { logger } from "./logger.js";

// NO leer en nivel de módulo — leer dentro de la función para que dotenv ya haya cargado
const GEMINI_MODEL = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Analiza el texto de un CV usando Gemini API y devuelve datos estructurados.
 * @param {string} text - Texto extraído del PDF
 * @returns {Promise<{nombre,cargo,experiencia,ciudad,certificaciones,resumen}>}
 */
export async function analyzeCvWithGemini(text) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw createHttpError(503, "Gemini API no está configurada. Agrega GEMINI_API_KEY en el .env del backend.");
  }

  if (!text || text.trim().length < 50) {
    throw createHttpError(400, "El CV es demasiado corto para analizar.");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL() });

  const prompt = `Analiza el siguiente CV y extrae la información en formato JSON estricto.
Responde ÚNICAMENTE con el JSON, sin texto adicional, sin markdown, sin bloques de código.

Formato requerido:
{
  "nombre": "nombre completo del candidato",
  "cargo": "cargo o título profesional principal",
  "experiencia": número entero de años de experiencia laboral,
  "ciudad": "ciudad de residencia",
  "certificaciones": ["cert1", "cert2"],
  "resumen": "resumen profesional de máximo 300 caracteres"
}

Reglas:
- "experiencia" debe ser un número entero (ej: 5), no texto
- "certificaciones" debe ser un array de strings con tecnologías, herramientas o certificados relevantes
- Si no encuentras un dato, usa "" para strings, 0 para números, [] para arrays
- No inventes información que no esté en el CV

CV:
${text.slice(0, 8000)}`;

  try {
    logger.info("Analizando CV con Gemini API", { model: GEMINI_MODEL() });

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    logger.info("Respuesta recibida de Gemini");

    // Limpiar posibles bloques de código markdown
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Intentar extraer JSON con regex si hay texto extra
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) {
        logger.error("Gemini no devolvió JSON válido", { raw: raw.slice(0, 200) });
        throw createHttpError(502, "Gemini no devolvió un formato válido. Intenta de nuevo.");
      }
      parsed = JSON.parse(match[0]);
    }

    // Normalizar y validar campos
    const resultado = {
      nombre:          typeof parsed.nombre === "string"        ? parsed.nombre.trim()          : "",
      cargo:           typeof parsed.cargo === "string"         ? parsed.cargo.trim()           : "",
      experiencia:     typeof parsed.experiencia === "number"   ? Math.max(0, Math.round(parsed.experiencia)) : parseInt(parsed.experiencia) || 0,
      ciudad:          typeof parsed.ciudad === "string"        ? parsed.ciudad.trim()          : "",
      certificaciones: Array.isArray(parsed.certificaciones)    ? parsed.certificaciones.filter(Boolean) : [],
      resumen:         typeof parsed.resumen === "string"       ? parsed.resumen.slice(0, 500)  : "",
    };

    logger.info("CV analizado con Gemini exitosamente", {
      nombre: resultado.nombre,
      cargo: resultado.cargo,
      experiencia: resultado.experiencia,
    });

    return resultado;
  } catch (error) {
    if (error.status) throw error; // Re-lanzar errores HTTP propios
    logger.error("Error llamando a Gemini API", { message: error.message });

    // Mensaje de error más descriptivo según el código HTTP
    if (error.message?.includes("429") || error.message?.includes("Too Many Requests")) {
      throw createHttpError(429,
        "Cuota de Gemini API excedida. Verifica tu plan en https://ai.google.dev/gemini-api/docs/rate-limits o espera unos minutos e intenta de nuevo."
      );
    }
    if (error.message?.includes("404") || error.message?.includes("not found")) {
      throw createHttpError(404,
        `Modelo Gemini '${GEMINI_MODEL()}' no disponible. Cambia GEMINI_MODEL en el .env del backend.`
      );
    }
    throw createHttpError(502, `Error de Gemini API: ${error.message}`);
  }
}

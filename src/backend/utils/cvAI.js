import { createHttpError } from "./httpError.js";
import { logger } from "./logger.js";
import { performance } from "perf_hooks";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 45000);
const OLLAMA_RETRIES = Number(process.env.OLLAMA_RETRIES || 2);
const OLLAMA_RETRY_DELAY_MS = Number(process.env.OLLAMA_RETRY_DELAY_MS || 500);

// Caché en memoria para evitar re-análisis del mismo CV
const analysisCache = new Map();
const CACHE_TTL_MS = 3600000; // 1 hora

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCacheKey(text) {
  // Hash simple del texto para caché
  return `${text.slice(0, 100)}_${text.length}`;
}

function getCachedAnalysis(text) {
  const key = getCacheKey(text);
  const cached = analysisCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    logger.info("Análisis de CV obtenido del caché");
    return cached.data;
  }
  
  if (cached) {
    analysisCache.delete(key);
  }
  return null;
}

function setCacheAnalysis(text, data) {
  const key = getCacheKey(text);
  analysisCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

async function callOllamaWithRetry(prompt) {
  const startTime = performance.now();

  for (let attempt = 1; attempt <= OLLAMA_RETRIES + 1; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

    try {
      logger.info(`Llamando Ollama (intento ${attempt}/${OLLAMA_RETRIES + 1})`, {
        model: OLLAMA_MODEL,
        timeout: OLLAMA_TIMEOUT_MS,
      });

      const startTime = performance.now();
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          options: {
            temperature: 0.1,
            top_p: 0.9,
            top_k: 40,
            num_predict: 500,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ollama error: ${response.status} ${errText}`);
      }

      const data = await response.json();
      const duration = (performance.now() - startTime).toFixed(2);
      logger.info(`Ollama respondió exitosamente en ${duration}ms`);
      return data;
    } catch (error) {
      const isTimeout = error.name === "AbortError";
      const duration = (performance.now() - startTime).toFixed(2);
      
      logger.warn("Ollama request failed", {
        attempt,
        message: error.message,
        isTimeout,
        duration: `${duration}ms`,
      });

      if (attempt <= OLLAMA_RETRIES) {
        const delayMs = OLLAMA_RETRY_DELAY_MS * attempt;
        logger.info(`Esperando ${delayMs}ms antes de reintentar...`);
        await sleep(delayMs);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw createHttpError(
    502,
    `Motor IA sin respuesta después de ${OLLAMA_RETRIES} intentos. Verifica que Ollama corra en: ${OLLAMA_URL}`
  );
}

/**
 * Analyzes CV text and extracts structured data with Ollama
 * @param {string} text - CV content text
 * @returns {Promise<Object>} Extracted CV data
 */
export async function analyzeCv(text) {
  // Checkear caché primero
  const cached = getCachedAnalysis(text);
  if (cached) {
    return cached;
  }

  // Prompt ultra-compacto para respuesta rápida
  const prompt = `JSON only, no text:
{
  "nombre": "",
  "cargo": "",
  "experiencia": 0,
  "ciudad": "",
  "certificaciones": [],
  "resumen": ""
}

CV: ${text.slice(0, 2000)}`;

  try {
    const data = await callOllamaWithRetry(prompt);
    const raw = data.response.trim();

    // Extraer JSON con mejor regex
    const match = raw.match(/\{[\s\S]*?\}/);

    if (!match) {
      logger.warn("No JSON found", { response: raw.slice(0, 100) });
      throw createHttpError(502, "No JSON in response");
    }

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      logger.warn("JSON parse error, usando valores por defecto");
      parsed = {
        nombre: "Candidato",
        cargo: "Sin especificar",
        experiencia: 0,
        ciudad: "No especificada",
        certificaciones: [],
        resumen: raw.slice(0, 200),
      };
    }

    // Asegurar campos mínimos
    if (!parsed.nombre) parsed.nombre = "Candidato";
    if (!parsed.cargo) parsed.cargo = "Sin especificar";
    if (!Array.isArray(parsed.certificaciones)) parsed.certificaciones = [];

    setCacheAnalysis(text, parsed);
    return parsed;
  } catch (error) {
    if (error.status === 502) throw error;
    logger.error("CV analysis error", { error: error.message });
    throw createHttpError(502, "Error: " + error.message);
  }
}
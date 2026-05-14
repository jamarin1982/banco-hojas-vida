import { execFile } from "child_process";
import { randomUUID } from "crypto";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import mammoth from "mammoth";

const execFileAsync = promisify(execFile);

export async function readCvFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    return readPdf(filePath);
  }

  if (ext === ".docx") {
    return readDocx(filePath);
  }

  // Para .doc y .odt intentamos pdftotext como fallback
  try {
    return await readPdf(filePath);
  } catch {
    throw new Error(`Formato de archivo no soportado: ${ext}. Solo se aceptan PDF y DOCX.`);
  }
}

async function readPdf(filePath) {
  const outputTxt = path.join(os.tmpdir(), `cv_${Date.now()}_${randomUUID()}.txt`);
  try {
    await execFileAsync("pdftotext", [filePath, outputTxt]);
    const text = await fs.readFile(outputTxt, "utf8");
    return text;
  } finally {
    await fs.rm(outputTxt, { force: true }).catch(() => {});
  }
}

async function readDocx(filePath) {
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

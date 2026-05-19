import { execFile } from "child_process";
import { randomUUID } from "crypto";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

const execFileAsync = promisify(execFile);

export async function readCvPdf(filePath) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(ROOT_DIR, filePath);
  const outputTxt = path.join(os.tmpdir(), `cv_${Date.now()}_${randomUUID()}.txt`);

  try {
    await execFileAsync("pdftotext", [absolutePath, outputTxt]);
    const text = await fs.readFile(outputTxt, "utf8");
    return text;
  } finally {
    await fs.rm(outputTxt, { force: true }).catch(() => {});
  }
}
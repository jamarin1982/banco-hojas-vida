import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  getUserById,
  getMiPerfilCandidato,
  updateMiPerfilCandidato,
  getMisAplicaciones,
  subirCvCandidato,
  analizarCvCandidato,
} from "../services/authService.js";
import { calculateMatchingForCandidate } from "../services/vacantesService.js";
import { readCvPdf } from "../utils/readCvPdf.js";
import { analyzeCv } from "../utils/cvAnalyzer.js";
import { analyzeCvWithGemini } from "../utils/cvGemini.js";

export async function registerHandler(req, res, next) {
  try {
    const { nombre, email, password, rol, nombreEmpresa, consentimiento } = req.body;
    const rolEfectivo = rol || "candidato";

    if (rolEfectivo === "candidato" && !consentimiento) {
      if (req.file) { const fs = await import("fs/promises"); await fs.unlink(req.file.path).catch(() => {}); }
      return res.status(400).json({ error: "Debes aceptar la política de tratamiento de datos personales." });
    }

    if (!nombre?.trim() || !email?.trim() || !password) {
      // Si multer subió un archivo pero hay error de validación, eliminarlo
      if (req.file) {
        const fs = await import("fs/promises");
        await fs.unlink(req.file.path).catch(() => {});
      }
      return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios." });
    }
    if (password.length < 8) {
      if (req.file) { const fs = await import("fs/promises"); await fs.unlink(req.file.path).catch(() => {}); }
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (req.file) { const fs = await import("fs/promises"); await fs.unlink(req.file.path).catch(() => {}); }
      return res.status(400).json({ error: "El formato del email no es válido." });
    }

    // CV obligatorio para candidatos
    if (rolEfectivo === "candidato" && !req.file) {
      return res.status(400).json({
        error: "Debes adjuntar tu hoja de vida (PDF, ODT, DOC o DOCX) para registrarte como candidato.",
      });
    }

    const result = await registerUser({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password,
      rol: rolEfectivo,
      nombreEmpresa,
      cvPath: req.file?.path || null,
      consentimiento: !!consentimiento,
      ipAddress: req.ip || req.connection?.remoteAddress,
    });
    res.status(201).json(result);
  } catch (err) {
    // Limpiar archivo si el registro falló
    if (req.file) {
      const fs = await import("fs/promises");
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(err);
  }
}

export async function loginHandler(req, res, next) {
  try {
    const { email, password, rolSolicitado } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios." });
    }
    const result = await loginUser({
      email: email.trim().toLowerCase(),
      password,
      rolSolicitado: rolSolicitado || null,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function meHandler(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function forgotPasswordHandler(req, res, next) {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ error: "El email es obligatorio." });
    }
    await requestPasswordReset(email.trim().toLowerCase());
    res.json({ message: "Si el email está registrado, recibirás un enlace para restablecer tu contraseña." });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordHandler(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token y nueva contraseña son obligatorios." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
    }
    await resetPassword({ token, newPassword: password });
    res.json({ message: "Contraseña restablecida exitosamente. Ya puedes iniciar sesión." });
  } catch (err) {
    next(err);
  }
}

// ─── Perfil candidato ─────────────────────────────────────────────────────────

export async function miPerfilCandidatoHandler(req, res, next) {
  try {
    const perfil = await getMiPerfilCandidato(req.user.id);
    res.json(perfil);
  } catch (err) {
    next(err);
  }
}

export async function updateMiPerfilCandidatoHandler(req, res, next) {
  try {
    const perfil = await updateMiPerfilCandidato(req.user.id, req.body);
    logger.info(`Perfil actualizado: id=${perfil?.id}, nombre=${perfil?.nombre}`);
    if (perfil?.id) {
      logger.info(`Recalculando matching para candidato ${perfil.id}`);
      const result = await calculateMatchingForCandidate(perfil.id);
      logger.info(`Matching recalculado: ${result} vacantes actualizadas`);
    } else {
      logger.warn(`No se pudo recalcular matching: perfil.id es ${perfil?.id}`);
    }
    res.json(perfil);
  } catch (err) {
    logger.error(`Error en updateMiPerfilCandidatoHandler:`, err);
    next(err);
  }
}

export async function misAplicacionesHandler(req, res, next) {
  try {
    const aplicaciones = await getMisAplicaciones(req.user.id);
    res.json(aplicaciones);
  } catch (err) {
    next(err);
  }
}

// ─── CV del perfil candidato ──────────────────────────────────────────────────

export async function subirCvPerfilHandler(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Debes adjuntar un archivo PDF." });
    }
    const result = await subirCvCandidato(req.user.id, req.file.path);
    if (result?.candidatoId) {
      await calculateMatchingForCandidate(result.candidatoId);
    }
    res.json({ message: "CV subido correctamente.", cvPath: result.cvPath });
  } catch (err) {
    next(err);
  }
}

export async function analizarCvPerfilHandler(req, res, next) {
  try {
    const cvPath = await analizarCvCandidato(req.user.id);
    const text = await readCvPdf(cvPath);
    const analysis = await analyzeCv(text);
    res.json(analysis);
  } catch (err) {
    next(err);
  }
}

export async function analizarCvPerfilGeminiHandler(req, res, next) {
  try {
    const cvPath = await analizarCvCandidato(req.user.id);
    const text = await readCvPdf(cvPath);
    const analysis = await analyzeCvWithGemini(text);
    res.json(analysis);
  } catch (err) {
    next(err);
  }
}

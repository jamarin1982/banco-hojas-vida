import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../db.js";
import { createHttpError } from "../utils/httpError.js";
import { logger } from "../utils/logger.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const RESET_TOKEN_EXPIRES_MINUTES = 30;

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function safeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

// ─── Registro ─────────────────────────────────────────────────────────────────

export async function registerUser({ nombre, email, password, rol = "candidato", nombreEmpresa }) {
  const now = new Date().toISOString();

  const rolesValidos = ["candidato", "empresa"];
  if (!rolesValidos.includes(rol)) {
    throw createHttpError(400, "Rol inválido. Debe ser 'candidato' o 'empresa'.");
  }

  if (rol === "empresa" && !nombreEmpresa?.trim()) {
    throw createHttpError(400, "El nombre de la empresa es obligatorio para cuentas de empresa.");
  }

  const [[existing]] = await pool.query("SELECT id, rol, password_hash, candidato_id FROM usuarios WHERE email = ?", [email]);

  // ── Caso especial: email ya existe con el otro rol ────────────────────────
  if (existing) {
    // Si intenta registrarse como candidato pero ya tiene cuenta de empresa:
    // verificar contraseña y activar perfil candidato en la misma cuenta
    if (rol === "candidato" && existing.rol === "empresa") {
      const valid = await bcrypt.compare(password, existing.password_hash);
      if (!valid) {
        throw createHttpError(
          409,
          "Este email ya está registrado como reclutador. Para activar también el perfil de candidato, usa la misma contraseña de tu cuenta de reclutador."
        );
      }
      // Contraseña correcta → crear perfil candidato si no tiene uno
      let candidatoId = existing.candidato_id;
      if (!candidatoId) {
        const [cr] = await pool.query(
          `INSERT INTO candidatos (nombre, ciudad, cargo, experiencia, certificaciones, disponibilidad, jornada, aspiracion, estado, observaciones)
           VALUES (?, 'Por definir', 'Por definir', 0, '', 'Inmediata', 'Completa', 0, 'Aplicó', '')`,
          [nombre]
        );
        candidatoId = cr.insertId;
        await pool.query("UPDATE usuarios SET candidato_id = ?, roles = 'empresa,candidato' WHERE id = ?", [candidatoId, existing.id]);
      }
      const [[user]] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [existing.id]);
      logger.info(`Perfil candidato activado para usuario empresa: ${email}`);
      // Devolver token con rol candidato para redirigir al portal candidato
      const tokenCandidato = jwt.sign(
        { id: user.id, email: user.email, rol: "candidato", nombre: user.nombre },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      return { token: tokenCandidato, user: { ...safeUser(user), rol: "candidato" } };
    }

    // Si intenta registrarse como empresa pero ya tiene cuenta de candidato:
    if (rol === "empresa" && existing.rol === "candidato") {
      throw createHttpError(
        409,
        "Este email ya está registrado como candidato. Inicia sesión en el acceso de candidato."
      );
    }

    // Mismo rol → email duplicado
    throw createHttpError(409, "Este email ya está registrado.");
  }

  // ── Registro nuevo ────────────────────────────────────────────────────────
  const password_hash = await bcrypt.hash(password, 12);

  const [result] = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, provider, rol, nombre_empresa, activo, fecha_creacion, fecha_actualizacion)
     VALUES (?, ?, ?, 'local', ?, ?, 1, ?, ?)`,
    [nombre, email, password_hash, rol, nombreEmpresa?.trim() || null, now, now]
  );

  const usuarioId = result.insertId;

  if (rol === "candidato") {
    const [candResult] = await pool.query(
      `INSERT INTO candidatos (nombre, ciudad, cargo, experiencia, certificaciones, disponibilidad, jornada, aspiracion, estado, observaciones)
       VALUES (?, 'Por definir', 'Por definir', 0, '', 'Inmediata', 'Completa', 0, 'Aplicó', '')`,
      [nombre]
    );
    await pool.query("UPDATE usuarios SET candidato_id = ? WHERE id = ?", [candResult.insertId, usuarioId]);
  }

  const [[user]] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [usuarioId]);
  logger.info(`Usuario registrado: ${email} (${rol})`);
  return { token: generateToken(user), user: safeUser(user) };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginUser({ email, password, rolSolicitado = null }) {
  const [[user]] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);

  if (!user || !user.password_hash) {
    throw createHttpError(401, "Email o contraseña incorrectos.");
  }
  if (!user.activo) {
    throw createHttpError(403, "Tu cuenta está desactivada. Contacta al administrador.");
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw createHttpError(401, "Email o contraseña incorrectos.");
  }

  // Si el usuario tiene ambos roles (empresa + candidato) y se solicita un rol específico
  const tieneAmbosRoles = user.roles === "empresa,candidato" || user.roles === "candidato,empresa";

  if (rolSolicitado && tieneAmbosRoles) {
    // Generar token con el rol solicitado
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: rolSolicitado, nombre: user.nombre },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    logger.info(`Login exitoso: ${email} (rol solicitado: ${rolSolicitado})`);
    return { token, user: { ...safeUser(user), rol: rolSolicitado } };
  }

  // Si intenta entrar como candidato pero solo tiene rol empresa (sin perfil candidato)
  if (rolSolicitado === "candidato" && user.rol === "empresa" && !tieneAmbosRoles) {
    throw createHttpError(
      403,
      "Esta cuenta es de reclutador. Para acceder como candidato, primero activa tu perfil de candidato desde el registro."
    );
  }

  // Si intenta entrar como empresa pero solo tiene rol candidato
  if (rolSolicitado === "empresa" && user.rol === "candidato" && !tieneAmbosRoles) {
    throw createHttpError(
      403,
      "Esta cuenta es de candidato. Usa el acceso de candidato."
    );
  }

  logger.info(`Login exitoso: ${email}`);
  return { token: generateToken(user), user: safeUser(user) };
}

// ─── Perfil candidato del usuario autenticado ─────────────────────────────────

export async function getMiPerfilCandidato(usuarioId) {
  const [[usuario]] = await pool.query(
    "SELECT candidato_id FROM usuarios WHERE id = ?",
    [usuarioId]
  );
  if (!usuario?.candidato_id) {
    throw createHttpError(404, "No tienes un perfil de candidato asociado.");
  }
  const [[candidato]] = await pool.query(
    "SELECT * FROM candidatos WHERE id = ?",
    [usuario.candidato_id]
  );
  if (!candidato) throw createHttpError(404, "Perfil de candidato no encontrado.");

  return {
    ...candidato,
    certificaciones: candidato.certificaciones
      ? candidato.certificaciones.split(",").map((c) => c.trim()).filter(Boolean)
      : [],
  };
}

export async function updateMiPerfilCandidato(usuarioId, datos) {
  const [[usuario]] = await pool.query(
    "SELECT candidato_id FROM usuarios WHERE id = ?",
    [usuarioId]
  );
  if (!usuario?.candidato_id) {
    throw createHttpError(404, "No tienes un perfil de candidato asociado.");
  }

  const now = new Date().toISOString();
  const certs = Array.isArray(datos.certificaciones)
    ? datos.certificaciones.join(", ")
    : datos.certificaciones || "";

  await pool.query(
    `UPDATE candidatos SET
       nombre = ?, ciudad = ?, cargo = ?, experiencia = ?,
       certificaciones = ?, disponibilidad = ?, jornada = ?,
       aspiracion = ?, observaciones = ?
     WHERE id = ?`,
    [
      datos.nombre || "",
      datos.ciudad || "Por definir",
      datos.cargo || "Por definir",
      datos.experiencia || 0,
      certs,
      datos.disponibilidad || "Inmediata",
      datos.jornada || "Completa",
      datos.aspiracion || 0,
      datos.observaciones || "",
      usuario.candidato_id,
    ]
  );

  return getMiPerfilCandidato(usuarioId);
}

// ─── Mis aplicaciones ─────────────────────────────────────────────────────────

export async function getMisAplicaciones(usuarioId) {
  const [[usuario]] = await pool.query(
    "SELECT candidato_id FROM usuarios WHERE id = ?",
    [usuarioId]
  );
  if (!usuario?.candidato_id) return [];

  const [rows] = await pool.query(
    `SELECT vcs.estado_aplicacion, vcs.score_total, vcs.fecha_score,
            v.id as vacante_id, v.titulo, v.cargo, v.ciudad, v.jornada,
            v.salario_minimo, v.salario_maximo, v.estado as vacante_estado
     FROM vacante_candidato_score vcs
     JOIN vacantes v ON vcs.vacante_id = v.id
     WHERE vcs.candidato_id = ?
     ORDER BY vcs.fecha_score DESC`,
    [usuario.candidato_id]
  );
  return rows;
}

// ─── CV del candidato ─────────────────────────────────────────────────────────

export async function subirCvCandidato(usuarioId, cvPath) {
  const [[usuario]] = await pool.query(
    "SELECT candidato_id FROM usuarios WHERE id = ?",
    [usuarioId]
  );
  if (!usuario?.candidato_id) {
    throw createHttpError(404, "No tienes un perfil de candidato asociado.");
  }
  await pool.query("UPDATE candidatos SET cv_path = ? WHERE id = ?", [cvPath, usuario.candidato_id]);
  return { cvPath };
}

export async function analizarCvCandidato(usuarioId) {
  const [[usuario]] = await pool.query(
    "SELECT candidato_id FROM usuarios WHERE id = ?",
    [usuarioId]
  );
  if (!usuario?.candidato_id) {
    throw createHttpError(404, "No tienes un perfil de candidato asociado.");
  }
  const [[candidato]] = await pool.query(
    "SELECT cv_path FROM candidatos WHERE id = ?",
    [usuario.candidato_id]
  );
  if (!candidato?.cv_path) {
    throw createHttpError(400, "Primero debes subir tu hoja de vida en PDF.");
  }
  return candidato.cv_path;
}

export async function requestPasswordReset(email) {
  const [[user]] = await pool.query(
    "SELECT id, nombre, email FROM usuarios WHERE email = ? AND provider = 'local'",
    [email]
  );
  if (!user) {
    logger.info(`Reset solicitado para email no encontrado: ${email}`);
    return;
  }

  await pool.query(
    "UPDATE password_reset_tokens SET usado = 1 WHERE usuario_id = ? AND usado = 0",
    [user.id]
  );

  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const expira = new Date(now.getTime() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000).toISOString();

  await pool.query(
    `INSERT INTO password_reset_tokens (usuario_id, token, expira_en, usado, fecha_creacion)
     VALUES (?, ?, ?, 0, ?)`,
    [user.id, token, expira, now.toISOString()]
  );

  await sendPasswordResetEmail({ email: user.email, nombre: user.nombre, token });
  logger.info(`Token de reset enviado a: ${email}`);
}

export async function resetPassword({ token, newPassword }) {
  const [[record]] = await pool.query(
    "SELECT * FROM password_reset_tokens WHERE token = ? AND usado = 0",
    [token]
  );
  if (!record) throw createHttpError(400, "El enlace de restablecimiento no es válido.");
  if (new Date(record.expira_en) < new Date()) {
    throw createHttpError(400, "El enlace de restablecimiento ha expirado. Solicita uno nuevo.");
  }

  const password_hash = await bcrypt.hash(newPassword, 12);
  const now = new Date().toISOString();

  await pool.query(
    "UPDATE usuarios SET password_hash = ?, fecha_actualizacion = ? WHERE id = ?",
    [password_hash, now, record.usuario_id]
  );
  await pool.query("UPDATE password_reset_tokens SET usado = 1 WHERE id = ?", [record.id]);
  logger.info(`Contraseña restablecida para usuario id: ${record.usuario_id}`);
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function getUserById(id) {
  const [[user]] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [id]);
  if (!user) return null;
  return safeUser(user);
}

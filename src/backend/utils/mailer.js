import nodemailer from "nodemailer";
import { logger } from "./logger.js";

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Si no hay config SMTP, usar Ethereal (solo para desarrollo)
  if (!host || !user) {
    logger.warn("SMTP no configurado. Los emails se simularán en consola.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

export async function sendPasswordResetEmail({ email, nombre, token }) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #7c3aed, #db2777); padding: 32px 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 700; }
        .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
        .body { padding: 36px 40px; }
        .body p { color: #475569; line-height: 1.6; margin: 0 0 16px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #db2777); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }
        .note { background: #f1f5f9; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #64748b; }
        .footer { text-align: center; padding: 20px 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        .url { word-break: break-all; color: #7c3aed; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Restablecer contraseña</h1>
          <p>Banco Hojas de Vida</p>
        </div>
        <div class="body">
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva contraseña:</p>
          <div style="text-align:center">
            <a href="${resetUrl}" class="btn">Restablecer contraseña</a>
          </div>
          <div class="note">
            ⏱ Este enlace expira en <strong>30 minutos</strong>.<br>
            Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no cambiará.
          </div>
          <p style="margin-top:20px; font-size:13px; color:#94a3b8;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
            <span class="url">${resetUrl}</span>
          </p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Banco Hojas de Vida · Este es un correo automático, no respondas.
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();

  if (!transporter) {
    // Modo desarrollo: imprimir en consola
    logger.info("=== EMAIL DE RESET (modo desarrollo) ===");
    logger.info(`Para: ${email}`);
    logger.info(`URL de reset: ${resetUrl}`);
    logger.info("=========================================");
    return;
  }

  await transporter.sendMail({
    from: `"Banco Hojas de Vida" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Restablece tu contraseña – Banco Hojas de Vida",
    html,
  });

  logger.info(`Email de reset enviado a: ${email}`);
}

export async function sendVacanteNotificationEmail({ email, nombre, vacanteTitulo, vacanteCargo, vacanteCiudad, score }) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const portalUrl = `${frontendUrl}/login/candidato`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #1565c0, #29b6f6); padding: 32px 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 700; }
        .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
        .body { padding: 36px 40px; }
        .body p { color: #475569; line-height: 1.6; margin: 0 0 16px; }
        .match-badge { display: inline-flex; align-items: center; gap: 6px; background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 18px; margin: 8px 0 20px; }
        .vacante-info { background: #f8fafc; border-radius: 12px; padding: 18px 22px; margin: 16px 0 24px; }
        .vacante-info p { margin: 4px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #1565c0, #29b6f6); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }
        .footer { text-align: center; padding: 20px 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Nueva vacante recomendada</h1>
          <p>Colba Empleos · Grupo Colba</p>
        </div>
        <div class="body">
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Se ha publicado una nueva vacante que coincide con tu perfil profesional:</p>
          <div class="vacante-info">
            <p style="font-size:18px;font-weight:700;color:#0f172a">${vacanteTitulo}</p>
            <p style="color:#64748b">${vacanteCargo} · ${vacanteCiudad}</p>
          </div>
          <div style="text-align:center">
            <div class="match-badge">⚡ Match: ${score}%</div>
          </div>
          <p style="text-align:center">Tu puntuación de coincidencia es superior al 75%, ¡esta oportunidad es ideal para ti!</p>
          <div style="text-align:center">
            <a href="${portalUrl}" class="btn">Ver vacante en el portal</a>
          </div>
          <p style="font-size:13px; color:#94a3b8; text-align:center;">Ingresa al portal de candidatos para ver los detalles y aplicar.</p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Colba Empleos · Grupo Colba · Este es un correo automático, no respondas.
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();

  if (!transporter) {
    logger.info("=== EMAIL DE VACANTE RECOMENDADA (modo desarrollo) ===");
    logger.info(`Para: ${email}`);
    logger.info(`Vacante: ${vacanteTitulo}`);
    logger.info(`Match: ${score}%`);
    logger.info(`Portal: ${portalUrl}`);
    logger.info("======================================================");
    return;
  }

  await transporter.sendMail({
    from: `"Colba Empleos" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🎯 Nueva vacante: ${vacanteTitulo} — Match ${score}%`,
    html,
  });

  logger.info(`Email de vacante enviado a: ${email} (match ${score}%)`);
}

export async function sendTestLinkEmail({ email, nombre, vacanteTitulo, candidatoNombre, testLink }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #1565c0, #29b6f6); padding: 32px 40px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 700; }
        .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
        .body { padding: 36px 40px; }
        .body p { color: #475569; line-height: 1.6; margin: 0 0 16px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #1565c0, #29b6f6); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }
        .info { background: #f8fafc; border-radius: 12px; padding: 18px 22px; margin: 16px 0 24px; }
        .info p { margin: 4px 0; font-size: 14px; }
        .footer { text-align: center; padding: 20px 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🖥️ Prueba técnica disponible</h1>
          <p>Has sido preseleccionado</p>
        </div>
        <div class="body">
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Has sido <strong>preseleccionado</strong> para la vacante <strong>${vacanteTitulo}</strong>. Como siguiente paso, te invitamos a presentar la prueba técnica.</p>
          <div class="info">
            <p><strong>Vacante:</strong> ${vacanteTitulo}</p>
            <p><strong>Candidato:</strong> ${candidatoNombre || nombre}</p>
          </div>
          <a href="${testLink}" class="btn">👉 Presentar prueba técnica</a>
          <p style="font-size: 13px; color: #94a3b8;">Este enlace es personal. No lo compartas con otras personas.</p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Colba Empleos · Grupo Colba
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();
  if (!transporter) {
    logger.info("=== EMAIL DE PRUEBA TÉCNICA (modo desarrollo) ===");
    logger.info(`Para: ${email}`);
    logger.info(`Vacante: ${vacanteTitulo}`);
    logger.info(`Link: ${testLink}`);
    logger.info("====================================================");
    return;
  }

  await transporter.sendMail({
    from: `"Colba Empleos" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🖥️ Prueba técnica: ${vacanteTitulo}`,
    html,
  });
  logger.info(`Email de prueba enviado a: ${email} (vacante: ${vacanteTitulo})`);
}

import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  registerHandler,
  loginHandler,
  meHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  miPerfilCandidatoHandler,
  updateMiPerfilCandidatoHandler,
  misAplicacionesHandler,
  subirCvPerfilHandler,
  analizarCvPerfilHandler,
  analizarCvPerfilGeminiHandler,
} from "../controllers/authController.js";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";

// Tipos de archivo permitidos para CV
const CV_MIMETYPES = [
  "application/pdf",
  "application/vnd.oasis.opendocument.text",          // .odt
  "application/msword",                                // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

const cvStorage = multer.diskStorage({
  destination: "uploads/cv",
  filename: (req, file, cb) => cb(null, `cv_${Date.now()}${path.extname(file.originalname)}`),
});

const cvFileFilter = (req, file, cb) => {
  CV_MIMETYPES.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Solo se permiten archivos PDF, ODT, DOC o DOCX"));
};

// Multer para CV en registro (público)
const uploadCvRegistro = multer({
  storage: cvStorage,
  fileFilter: cvFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Multer para CV del perfil candidato (autenticado)
const uploadCvPerfil = multer({
  storage: cvStorage,
  fileFilter: cvFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

// ─── Públicas ─────────────────────────────────────────────────────────────────
// El registro de candidato acepta multipart/form-data con el CV obligatorio
router.post("/register", uploadCvRegistro.single("cv"), registerHandler);
router.post("/login", loginHandler);
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);

// ─── Autenticadas ─────────────────────────────────────────────────────────────
router.get("/me", requireAuth, meHandler);

// ─── Solo candidatos ──────────────────────────────────────────────────────────
router.get("/mi-perfil", requireAuth, requireRole("candidato"), miPerfilCandidatoHandler);
router.put("/mi-perfil", requireAuth, requireRole("candidato"), updateMiPerfilCandidatoHandler);
router.get("/mis-aplicaciones", requireAuth, requireRole("candidato"), misAplicacionesHandler);
router.post("/mi-perfil/cv",              requireAuth, requireRole("candidato"), uploadCvPerfil.single("cv"), subirCvPerfilHandler);
router.post("/mi-perfil/analizar-cv",    requireAuth, requireRole("candidato"), analizarCvPerfilHandler);
router.post("/mi-perfil/analizar-cv-gemini", requireAuth, requireRole("candidato"),
  (req, res, next) => { res.setTimeout(90000); next(); },
  analizarCvPerfilGeminiHandler
);

export default router;

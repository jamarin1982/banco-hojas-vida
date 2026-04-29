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
} from "../controllers/authController.js";
import { requireAuth, requireRole } from "../middlewares/requireAuth.js";

// Multer para CV del perfil candidato
const uploadCvPerfil = multer({
  storage: multer.diskStorage({
    destination: "uploads/cv",
    filename: (req, file, cb) => cb(null, `cv_${Date.now()}${path.extname(file.originalname)}`),
  }),
  fileFilter: (req, file, cb) => {
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(new Error("Solo se permiten archivos PDF"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

// ─── Públicas ─────────────────────────────────────────────────────────────────
router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);

// ─── Autenticadas ─────────────────────────────────────────────────────────────
router.get("/me", requireAuth, meHandler);

// ─── Solo candidatos ──────────────────────────────────────────────────────────
router.get("/mi-perfil", requireAuth, requireRole("candidato"), miPerfilCandidatoHandler);
router.put("/mi-perfil", requireAuth, requireRole("candidato"), updateMiPerfilCandidatoHandler);
router.get("/mis-aplicaciones", requireAuth, requireRole("candidato"), misAplicacionesHandler);
router.post("/mi-perfil/cv", requireAuth, requireRole("candidato"), uploadCvPerfil.single("cv"), subirCvPerfilHandler);
router.post("/mi-perfil/analizar-cv", requireAuth, requireRole("candidato"), analizarCvPerfilHandler);

export default router;

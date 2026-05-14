import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, UserCheck, ArrowLeft, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiLogin, apiRegister } from "@/services/authApi";
import { ColbaLogoIcon } from "@/components/ColbaLogo";

export default function LoginCandidatoPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [cvFile, setCvFile] = useState(null);

  const setField = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await apiLogin({ email: form.email, password: form.password, rolSolicitado: "candidato" });
        if (result.user.rol !== "candidato") {
          setError("Esta cuenta no es de candidato. Usa el acceso de reclutador.");
          setLoading(false);
          return;
        }
      } else {
        // Validar CV obligatorio
        if (!cvFile) {
          throw new Error("Debes adjuntar tu hoja de vida (PDF o DOCX) para registrarte.");
        }
        const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowedTypes.includes(cvFile.type)) {
          throw new Error("Formato no válido. Solo se permiten archivos PDF o DOCX.");
        }
        if (cvFile.size > 10 * 1024 * 1024) {
          throw new Error("El archivo excede el tamaño máximo de 10 MB.");
        }
        result = await apiRegister({ nombre: form.nombre, email: form.email, password: form.password, rol: "candidato", cvFile });
      }
      login(result.token, result.user);
      navigate("/candidato", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #1565c0 0%, #1a3a6b 50%, #0d2a52 100%)" }}>
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-blue-300 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Cambiar tipo de acceso
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ColbaLogoIcon size={108} />
          </div>
          <h1 className="text-2xl font-bold text-white">Colba Empleos</h1>
          <p className="text-blue-300 text-sm mt-1">Acceso Candidato · Grupo Colba</p>
        </div>

        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  mode === m ? "border-b-2 bg-blue-50/50" : "text-slate-500 hover:text-slate-700"
                }`}
                style={mode === m ? { color: "#1565c0", borderColor: "#29b6f6" } : {}}
              >
                {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {/* Badge */}
            <div className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: "#e3f2fd", border: "1px solid #90caf9" }}>
              <UserCheck className="h-4 w-4 flex-shrink-0" style={{ color: "#1565c0" }} />
              <p className="text-xs font-medium" style={{ color: "#1a3a6b" }}>
                {mode === "login"
                  ? "Acceso exclusivo para candidatos en búsqueda de empleo"
                  : "Si ya tienes cuenta de reclutador, usa el mismo email y contraseña para activar tu perfil de candidato"}
              </p>
            </div>

            {error && (
              <Motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 p-3">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </Motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input value={form.nombre} onChange={(e) => setField("nombre", e.target.value)} placeholder="Juan Pérez" className="pl-9" required />
                  </div>
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Hoja de vida <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                      <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      {cvFile ? (
                        <span className="flex-1 truncate text-slate-700">{cvFile.name}</span>
                      ) : (
                        <span className="flex-1">Seleccionar archivo PDF o DOCX</span>
                      )}
                      <label className="cursor-pointer rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors ml-auto flex-shrink-0">
                        {cvFile ? "Cambiar" : "Examinar"}
                        <input
                          type="file"
                          accept=".pdf,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setCvFile(file);
                            if (file) {
                              const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
                              if (!allowed.includes(file.type)) {
                                setError("Formato no válido. Solo se permiten archivos PDF o DOCX.");
                                setCvFile(null);
                              } else if (file.size > 10 * 1024 * 1024) {
                                setError("El archivo excede el tamaño máximo de 10 MB.");
                                setCvFile(null);
                              } else {
                                setError("");
                              }
                            }
                          }}
                        />
                      </label>
                      {cvFile && (
                        <button type="button" onClick={() => { setCvFile(null); setError(""); }} className="text-slate-400 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Archivos PDF o DOCX · Máximo 10 MB</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="tu@email.com" className="pl-9" required autoComplete="email" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700">Contraseña</Label>
                  {mode === "login" && (
                    <Link to="/forgot-password" className="text-xs font-medium" style={{ color: "#1565c0" }}>
                      ¿Olvidaste tu contraseña?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setField("password", e.target.value)}
                    placeholder={mode === "register" ? "Mínimo 8 caracteres" : "Tu contraseña"} className="pl-9 pr-10"
                    required minLength={mode === "register" ? 8 : undefined}
                    autoComplete={mode === "login" ? "current-password" : "new-password"} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2 text-white font-semibold py-2.5"
                style={{ background: "linear-gradient(135deg, #1565c0, #29b6f6)" }}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />{mode === "login" ? "Ingresando..." : "Creando cuenta..."}</>
                ) : mode === "login" ? "Ingresar al portal" : "Crear mi cuenta"}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-blue-400 mt-6">
          ¿Eres reclutador?{" "}
          <Link to="/login/empresa" className="text-blue-200 hover:text-white font-medium">Accede aquí</Link>
        </p>
      </Motion.div>
    </div>
  );
}

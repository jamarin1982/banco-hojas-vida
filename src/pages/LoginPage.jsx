import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, Briefcase, UserCheck, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiLogin, apiRegister } from "@/services/authApi";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nombre: "", email: "", password: "", rol: "candidato", nombreEmpresa: "",
  });
  const [cvFile, setCvFile] = useState(null);

  const setField = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await apiLogin({ email: form.email, password: form.password });
      } else {
        if (form.rol === "candidato") {
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
        }
        result = await apiRegister({
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          rol: form.rol,
          nombreEmpresa: form.rol === "empresa" ? form.nombreEmpresa : undefined,
          cvFile: form.rol === "candidato" ? cvFile : undefined,
        });
      }
      login(result.token, result.user);
      // Redirigir según rol
      navigate(result.user.rol === "empresa" ? "/empresa" : "/candidato", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">BH</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Banco Hojas de Vida</h1>
          <p className="text-slate-400 text-sm mt-1">Gestión de Talento</p>
        </div>

        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                mode === "login"
                  ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                mode === "register"
                  ? "text-purple-700 border-b-2 border-purple-600 bg-purple-50/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Error */}
            {error && (
              <Motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 p-3"
              >
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </Motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selector de tipo de cuenta — solo en registro */}
              {mode === "register" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Tipo de cuenta</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setField("rol", "candidato")}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        form.rol === "candidato"
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <UserCheck className="h-6 w-6" />
                      <div className="text-center">
                        <p className="text-sm font-semibold">Candidato</p>
                        <p className="text-xs opacity-70 mt-0.5">Busco empleo</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setField("rol", "empresa")}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        form.rol === "empresa"
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <Briefcase className="h-6 w-6" />
                      <div className="text-center">
                        <p className="text-sm font-semibold">Empresa</p>
                        <p className="text-xs opacity-70 mt-0.5">Busco talento</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Nombre */}
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    {form.rol === "empresa" ? "Nombre del responsable" : "Nombre completo"}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={form.nombre}
                      onChange={(e) => setField("nombre", e.target.value)}
                      placeholder={form.rol === "empresa" ? "Ana García" : "Juan Pérez"}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Nombre empresa — solo si rol empresa */}
              <AnimatePresence>
                {mode === "register" && form.rol === "empresa" && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <Label className="text-sm font-medium text-slate-700">Nombre de la empresa</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={form.nombreEmpresa}
                        onChange={(e) => setField("nombreEmpresa", e.target.value)}
                        placeholder="Empresa S.A.S."
                        className="pl-9"
                        required
                      />
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* CV — solo si rol candidato */}
              <AnimatePresence>
                {mode === "register" && form.rol === "candidato" && (
                  <Motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <Label className="text-sm font-medium text-slate-700">
                      Hoja de vida <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                      <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      {cvFile ? (
                        <span className="flex-1 truncate text-slate-700">{cvFile.name}</span>
                      ) : (
                        <span className="flex-1">Seleccionar archivo PDF o DOCX</span>
                      )}
                      <label className="cursor-pointer rounded-md bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors ml-auto flex-shrink-0">
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
                    <p className="text-xs text-slate-400">Archivos PDF o DOCX · Máximo 10 MB</p>
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="tu@email.com"
                    className="pl-9"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700">Contraseña</Label>
                  {mode === "login" && (
                    <Link to="/forgot-password" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder={mode === "register" ? "Mínimo 8 caracteres" : "Tu contraseña"}
                    className="pl-9 pr-10"
                    required
                    minLength={mode === "register" ? 8 : undefined}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "login" ? "Ingresando..." : "Creando cuenta..."}
                  </>
                ) : mode === "login" ? (
                  "Iniciar sesión"
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Al continuar, aceptas los términos de uso del sistema.
        </p>
      </Motion.div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, UserCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiLogin, apiRegister } from "@/services/authApi";

export default function LoginCandidatoPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });

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
        result = await apiRegister({
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          rol: "candidato",
        });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 flex items-center justify-center p-4">
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Volver */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Cambiar tipo de acceso
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg mb-4">
            <UserCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Acceso Candidato</h1>
          <p className="text-slate-400 text-sm mt-1">Encuentra tu próxima oportunidad</p>
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
            {/* Badge de rol */}
            <div className="flex items-center gap-2 rounded-lg bg-purple-50 border border-purple-200 px-3 py-2">
              <UserCheck className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <p className="text-xs text-purple-700 font-medium">
                {mode === "login"
                  ? "Acceso exclusivo para candidatos en búsqueda de empleo"
                  : "Si ya tienes cuenta de reclutador, usa el mismo email y contraseña para activar tu perfil de candidato"}
              </p>
            </div>

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
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={form.nombre}
                      onChange={(e) => setField("nombre", e.target.value)}
                      placeholder="Juan Pérez"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              )}

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
                className="w-full gap-2 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-semibold py-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "login" ? "Ingresando..." : "Creando cuenta..."}
                  </>
                ) : mode === "login" ? (
                  "Ingresar al portal"
                ) : (
                  "Crear mi cuenta"
                )}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          ¿Eres reclutador?{" "}
          <Link to="/login/empresa" className="text-amber-400 hover:text-amber-300 font-medium">
            Accede aquí
          </Link>
        </p>
      </Motion.div>
    </div>
  );
}

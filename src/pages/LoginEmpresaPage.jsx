import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, Briefcase, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiLogin, apiRegister } from "@/services/authApi";

export default function LoginEmpresaPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ nombre: "", nombreEmpresa: "", email: "", password: "" });

  const setField = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await apiLogin({ email: form.email, password: form.password, rolSolicitado: "empresa" });
        if (result.user.rol !== "empresa") {
          setError("Esta cuenta no es de reclutador. Usa el acceso de candidato.");
          setLoading(false);
          return;
        }
      } else {
        result = await apiRegister({
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          rol: "empresa",
          nombreEmpresa: form.nombreEmpresa,
        });
      }
      login(result.token, result.user);
      navigate("/empresa", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 flex items-center justify-center p-4">
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
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg mb-4">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Acceso Reclutador</h1>
          <p className="text-slate-400 text-sm mt-1">Gestiona talento y vacantes</p>
        </div>

        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                mode === "login"
                  ? "text-amber-700 border-b-2 border-amber-500 bg-amber-50/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                mode === "register"
                  ? "text-amber-700 border-b-2 border-amber-500 bg-amber-50/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Registrar empresa
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Badge de rol */}
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <Briefcase className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                {mode === "login"
                  ? "Acceso exclusivo para reclutadores y empresas"
                  : "Tu cuenta tendrá acceso al panel de reclutamiento"}
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
                <>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700">Nombre del responsable</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={form.nombre}
                        onChange={(e) => setField("nombre", e.target.value)}
                        placeholder="Ana García"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
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
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Email corporativo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="reclutador@empresa.com"
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
                    <Link to="/forgot-password" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
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
                className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "login" ? "Ingresando..." : "Creando cuenta..."}
                  </>
                ) : mode === "login" ? (
                  "Ingresar al panel"
                ) : (
                  "Crear cuenta de empresa"
                )}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          ¿Eres candidato?{" "}
          <Link to="/login/candidato" className="text-purple-400 hover:text-purple-300 font-medium">
            Accede aquí
          </Link>
        </p>
      </Motion.div>
    </div>
  );
}

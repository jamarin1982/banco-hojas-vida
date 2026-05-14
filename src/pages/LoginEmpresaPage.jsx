import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, Briefcase, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiLogin, apiRegister } from "@/services/authApi";
import { ColbaLogoIcon } from "@/components/ColbaLogo";

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
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0d2a52 0%, #1a3a6b 60%, #1565c0 100%)" }}>
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
          <p className="text-blue-300 text-sm mt-1">Acceso Reclutador · Grupo Colba</p>
        </div>

        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  mode === m
                    ? "border-b-2 bg-blue-50/50"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                style={mode === m ? { color: "#1a3a6b", borderColor: "#1565c0" } : {}}
              >
                {m === "login" ? "Iniciar sesión" : "Registrar empresa"}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {/* Badge */}
            <div className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: "#e8f0fe", border: "1px solid #90caf9" }}>
              <Briefcase className="h-4 w-4 flex-shrink-0" style={{ color: "#1565c0" }} />
              <p className="text-xs font-medium" style={{ color: "#1a3a6b" }}>
                {mode === "login" ? "Acceso exclusivo para reclutadores y empresas" : "Tu cuenta tendrá acceso al panel de reclutamiento"}
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
                <>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700">Nombre del responsable</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input value={form.nombre} onChange={(e) => setField("nombre", e.target.value)} placeholder="Ana García" className="pl-9" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700">Nombre de la empresa</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input value={form.nombreEmpresa} onChange={(e) => setField("nombreEmpresa", e.target.value)} placeholder="Empresa S.A.S." className="pl-9" required />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Email corporativo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="reclutador@empresa.com" className="pl-9" required autoComplete="email" />
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
                style={{ background: "linear-gradient(135deg, #1a3a6b, #1565c0)" }}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />{mode === "login" ? "Ingresando..." : "Creando cuenta..."}</>
                ) : mode === "login" ? "Ingresar al panel" : "Crear cuenta de empresa"}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-blue-400 mt-6">
          ¿Eres candidato?{" "}
          <Link to="/login/candidato" className="text-blue-200 hover:text-white font-medium">Accede aquí</Link>
        </p>
      </Motion.div>
    </div>
  );
}

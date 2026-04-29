import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiResetPassword } from "@/services/authApi";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!token) {
      setError("El enlace no es válido. Solicita uno nuevo.");
      return;
    }

    setLoading(true);
    try {
      await apiResetPassword({ token, password });
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
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
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">BH</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Banco Hojas de Vida</h1>
        </div>

        <div className="rounded-2xl bg-white shadow-2xl p-6 space-y-5">
          {!token ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-7 w-7 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Enlace inválido</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Este enlace no es válido o ya fue utilizado.
                  </p>
                </div>
              </div>
              <Link to="/forgot-password">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Solicitar nuevo enlace
                </Button>
              </Link>
            </div>
          ) : success ? (
            <Motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">¡Contraseña actualizada!</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Tu contraseña fue cambiada exitosamente. Redirigiendo al inicio de sesión...
                  </p>
                </div>
              </div>
            </Motion.div>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Nueva contraseña</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Elige una contraseña segura de al menos 8 caracteres.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 p-3">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="pl-9 pr-10"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Indicador de fortaleza */}
                  {password && (
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            password.length >= i * 3
                              ? password.length >= 12
                                ? "bg-green-500"
                                : password.length >= 8
                                ? "bg-yellow-400"
                                : "bg-red-400"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repite la contraseña"
                      className={`pl-9 ${
                        confirm && confirm !== password ? "border-red-300 focus:ring-red-400" : ""
                      }`}
                      required
                    />
                  </div>
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar nueva contraseña"
                  )}
                </Button>
              </form>

              <Link
                to="/acceso"
                className="flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al inicio de sesión
              </Link>
            </>
          )}
        </div>
      </Motion.div>
    </div>
  );
}

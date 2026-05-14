import { useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiForgotPassword } from "@/services/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiForgotPassword(email.trim().toLowerCase());
      setSent(true);
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
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div style={{
              width: 101, height: 101, borderRadius: "18px", flexShrink: 0,
              background: "linear-gradient(135deg, #64d4f7 0%, #29b6f6 30%, #1565c0 65%, #0d2a52 100%)",
              padding: 5,
              boxShadow: "0 0 28px rgba(41,182,246,0.6), 0 6px 24px rgba(0,0,0,0.5)",
            }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: "13px",
                background: "white", display: "flex", alignItems: "center",
                justifyContent: "center", overflow: "hidden",
              }}>
                <img src="/logo-colba.png" alt="Grupo Colba"
                  style={{ width: "90%", height: "90%", objectFit: "contain" }} />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Colba Empleos</h1>
        </div>

        <div className="rounded-2xl bg-white shadow-2xl p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Restablecer contraseña</h2>
            <p className="text-sm text-slate-500 mt-1">
              Ingresa tu email y te enviaremos un enlace para crear una nueva contraseña.
            </p>
          </div>

          {sent ? (
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
                  <p className="font-semibold text-slate-900">¡Revisa tu correo!</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Si <span className="font-medium text-slate-700">{email}</span> está registrado,
                    recibirás un enlace en los próximos minutos.
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Revisa también tu carpeta de spam.
                  </p>
                </div>
              </div>
              <Link to="/acceso">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
                </Button>
              </Link>
            </Motion.div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 p-3">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-9"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar enlace de restablecimiento"
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

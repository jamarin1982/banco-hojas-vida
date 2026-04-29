import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Briefcase, UserCheck, ArrowRight, Users, Zap, Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function AccesoPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();

  // Si ya está autenticado, redirigir al dashboard correspondiente
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const destino = user.rol === "empresa" ? "/empresa" : "/candidato";
      navigate(destino, { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl mb-5">
          <span className="text-3xl font-bold text-white">BH</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Banco Hojas de Vida</h1>
        <p className="text-slate-400 mt-2">¿Cómo deseas acceder al sistema?</p>
      </Motion.div>

      {/* Tarjetas de acceso */}
      <div className="grid gap-5 sm:grid-cols-2 w-full max-w-2xl">
        {/* Reclutador */}
        <Motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/login/empresa")}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-left shadow-xl hover:shadow-amber-500/25 hover:shadow-2xl transition-shadow"
        >
          {/* Fondo decorativo */}
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-0 h-20 w-20 -translate-x-6 translate-y-6 rounded-full bg-white/10" />

          <div className="relative space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Soy Reclutador</h2>
              <p className="text-amber-100 text-sm mt-1 leading-relaxed">
                Gestiona candidatos, publica vacantes y encuentra el talento ideal con matching automático.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Gestionar candidatos", "Crear vacantes", "Matching IA"].map((f) => (
                <span key={f} className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">
                  {f}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
              Acceder como reclutador
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Motion.button>

        {/* Candidato */}
        <Motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/login/candidato")}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 p-8 text-left shadow-xl hover:shadow-purple-500/25 hover:shadow-2xl transition-shadow"
        >
          {/* Fondo decorativo */}
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-0 h-20 w-20 -translate-x-6 translate-y-6 rounded-full bg-white/10" />

          <div className="relative space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <UserCheck className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Soy Candidato</h2>
              <p className="text-purple-200 text-sm mt-1 leading-relaxed">
                Explora vacantes disponibles, completa tu perfil y aplica a las oportunidades que te interesan.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Ver vacantes", "Mi perfil", "Mis aplicaciones"].map((f) => (
                <span key={f} className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">
                  {f}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
              Acceder como candidato
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Motion.button>
      </div>

      {/* Stats decorativos */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex gap-8 mt-12 text-center"
      >
        {[
          { icon: Users, label: "Candidatos activos", value: "+" },
          { icon: Briefcase, label: "Vacantes publicadas", value: "+" },
          { icon: Zap, label: "Matching automático", value: "IA" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-slate-400">
              <Icon className="h-4 w-4" />
              <span className="text-xs">{label}</span>
            </div>
          </div>
        ))}
      </Motion.div>

      <p className="text-slate-600 text-xs mt-8">
        © {new Date().getFullYear()} Banco Hojas de Vida
      </p>
    </div>
  );
}

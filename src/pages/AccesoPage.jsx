import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Briefcase, UserCheck, ArrowRight, Users, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

// Logo oficial de Grupo Colba
function ColbaLogo({ size = 48 }) {
  const border = Math.max(3, Math.round(size * 0.055));
  return (
    <div style={{
      width: size, height: size, borderRadius: "18px", flexShrink: 0,
      background: "linear-gradient(135deg, #64d4f7 0%, #29b6f6 30%, #1565c0 65%, #0d2a52 100%)",
      padding: border,
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
  );
}

export default function AccesoPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const destino = user.rol === "empresa" ? "/empresa" : "/candidato";
      navigate(destino, { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0d2a52 0%, #1a3a6b 50%, #1565c0 100%)" }}>

      {/* Logo y nombre */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-5">
          <ColbaLogo size={130} />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Colba Empleos</h1>
        <p className="text-blue-200 mt-2 text-base">Plataforma de Gestión de Talento · Grupo Colba</p>
        <p className="text-blue-300 mt-4 text-sm">¿Cómo deseas acceder al sistema?</p>
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
          className="group relative overflow-hidden rounded-2xl p-8 text-left shadow-xl transition-shadow"
          style={{ background: "linear-gradient(135deg, #1a3a6b, #1565c0)" }}
        >
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-0 h-20 w-20 -translate-x-6 translate-y-6 rounded-full bg-white/10" />
          <div className="relative space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Soy Reclutador</h2>
              <p className="text-blue-200 text-sm mt-1 leading-relaxed">
                Gestiona candidatos, publica vacantes y encuentra el talento ideal con matching automático.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Gestionar candidatos", "Crear vacantes", "Matching IA"].map((f) => (
                <span key={f} className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">{f}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
              Acceder como reclutador <ArrowRight className="h-4 w-4" />
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
          className="group relative overflow-hidden rounded-2xl p-8 text-left shadow-xl transition-shadow"
          style={{ background: "linear-gradient(135deg, #1565c0, #29b6f6)" }}
        >
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-0 h-20 w-20 -translate-x-6 translate-y-6 rounded-full bg-white/10" />
          <div className="relative space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <UserCheck className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Soy Candidato</h2>
              <p className="text-blue-100 text-sm mt-1 leading-relaxed">
                Explora vacantes disponibles, completa tu perfil y aplica a las oportunidades que te interesan.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Ver vacantes", "Mi perfil", "Mis aplicaciones"].map((f) => (
                <span key={f} className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">{f}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
              Acceder como candidato <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Motion.button>
      </div>

      <p className="text-blue-400 text-xs mt-10">
        © {new Date().getFullYear()} Grupo Colba · Colba Empleos
      </p>
    </div>
  );
}

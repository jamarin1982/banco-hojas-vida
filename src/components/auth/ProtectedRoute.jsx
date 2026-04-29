import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children, rol }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Mientras verifica el token, mostrar spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="h-6 w-6 animate-spin text-purple-300" />
          <span className="text-lg font-medium">Cargando...</span>
        </div>
      </div>
    );
  }

  // No autenticado → login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Rol incorrecto → redirigir al dashboard propio
  if (rol && user?.rol !== rol) {
    // 'reclutador' es rol legacy, tratarlo como empresa
    const rolEfectivo = user?.rol === "reclutador" ? "empresa" : user?.rol;
    if (rolEfectivo === rol) return children;
    const destino = rolEfectivo === "empresa" ? "/empresa" : "/candidato";
    return <Navigate to={destino} replace />;
  }

  return children;
}

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import BancoHojasVidaMVP from "./pages/BancoHojasVidaMVP";
import CandidatoDashboard from "./pages/CandidatoDashboard";
import AccesoPage from "./pages/AccesoPage";
import LoginEmpresaPage from "./pages/LoginEmpresaPage";
import LoginCandidatoPage from "./pages/LoginCandidatoPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PoliticaDatosPage from "./pages/PoliticaDatosPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Spinner de carga global
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
      <div className="flex items-center gap-3 text-white">
        <Loader2 className="h-6 w-6 animate-spin text-purple-300" />
        <span className="text-lg font-medium">Cargando...</span>
      </div>
    </div>
  );
}

// Redirige al dashboard correcto si ya está autenticado
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/acceso" replace />;
  const destino = (user.rol === "empresa" || user.rol === "reclutador") ? "/empresa" : "/candidato";
  return <Navigate to={destino} replace />;
}

function App() {
  return (
    <Routes>
      {/* Selección de tipo de acceso */}
      <Route path="/acceso" element={<AccesoPage />} />

      {/* Login por rol */}
      <Route path="/login/empresa" element={<LoginEmpresaPage />} />
      <Route path="/login/candidato" element={<LoginCandidatoPage />} />

      {/* Compatibilidad con ruta /login antigua */}
      <Route path="/login" element={<Navigate to="/acceso" replace />} />

      {/* Recuperar contraseña */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Política de datos */}
      <Route path="/politica-de-datos" element={<PoliticaDatosPage />} />

      {/* Dashboard empresa/reclutador */}
      <Route
        path="/empresa"
        element={
          <ProtectedRoute rol="empresa">
            <BancoHojasVidaMVP />
          </ProtectedRoute>
        }
      />

      {/* Dashboard candidato */}
      <Route
        path="/candidato"
        element={
          <ProtectedRoute rol="candidato">
            <CandidatoDashboard />
          </ProtectedRoute>
        }
      />

      {/* Raíz y fallback */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

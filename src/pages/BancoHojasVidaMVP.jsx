import { Tabs, TabsContent } from "@/components/ui/tabs";
import { getCvUrl } from "@/services/candidatosApi";
import { statusColor } from "@/features/candidatos/model";
import { CandidateForm } from "@/components/banco-hojas-vida/CandidateForm";
import { MetricsCards } from "@/components/banco-hojas-vida/MetricsCards";
import { VacanteMatchingPanel } from "@/components/banco-hojas-vida/VacanteMatchingPanel";
import { VacanteForm } from "@/components/banco-hojas-vida/VacanteForm";
import { VacantesList } from "@/components/banco-hojas-vida/VacantesList";
import { DashboardSidebar, DashboardMobileNav } from "@/components/banco-hojas-vida/DashboardSidebar";
import { DashboardHeader } from "@/components/banco-hojas-vida/DashboardHeader";
import { useCandidatesDashboard } from "@/hooks/useCandidatesDashboard";
import { useVacantesManager } from "@/hooks/useVacantesManager";
import { TalentTab } from "@/components/banco-hojas-vida/TalentTab";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function BancoHojasVidaMVP() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const {
    activeTab,
    setActiveTab,
    candidates,
    query,
    setQuery,
    filterCity,
    setFilterCity,
    filterCargo,
    setFilterCargo,
    form,
    setForm,
    loadingIA,
    analyzeError,
    analyzeProgress,
    editingCandidate,
    setEditingCandidate,
    enriched,
    filtered,
    metrics,
    handleAdd,
    handleDelete,
    moveStatus,
    handleAnalyzeCv,
  } = useCandidatesDashboard();

  const {
    vacantes,
    selectedVacante,
    topCandidates,
    form: vacanteForm,
    setForm: setVacanteForm,
    loading: vacanteLoading,
    error: vacanteError,
    handleAddVacante,
    handleDeleteVacante,
    handleSelectVacante,
    handleNewVacante,
    preguntas,
    setPreguntas,
  } = useVacantesManager();

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (analyzeError) {
      setNotification({
        type: "error",
        message: analyzeError,
      });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [analyzeError]);

  useEffect(() => {
    if (vacanteError) {
      setNotification({
        type: "error",
        message: vacanteError,
      });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [vacanteError]);

  useEffect(() => {
    if (analyzeProgress) {
      setNotification({
        type: "progress",
        message: analyzeProgress,
      });
      
      // Auto-limpiar notificación después de 8 segundos
      // (el análisis típicamente dura 1-3 segundos)
      const timeout = setTimeout(() => {
        setNotification(null);
      }, 8000);
      
      return () => clearTimeout(timeout);
    } else {
      // Cuando analyzeProgress se vuelve vacío, limpiar inmediatamente
      setNotification(null);
    }
  }, [analyzeProgress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50 lg:pl-64">
      {/* Sidebar */}
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout} />
      <DashboardMobileNav activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout} />

      {/* Notificación flotante */}
      {notification && (
        <div
          className={`fixed top-4 right-4 rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-md z-50 animate-slide-in ${
            notification.type === "error"
              ? "bg-red-50 border border-red-200"
              : notification.type === "progress"
              ? "bg-blue-50 border border-blue-200"
              : "bg-green-50 border border-green-200"
          }`}
        >
          {notification.type === "error" ? (
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : notification.type === "progress" ? (
            <div className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5">
              <div className="animate-spin">⏳</div>
            </div>
          ) : (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p
              className={`text-sm font-medium ${
                notification.type === "error"
                  ? "text-red-900"
                  : notification.type === "progress"
                  ? "text-blue-900"
                  : "text-green-900"
              }`}
            >
              {notification.message}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="space-y-8 px-4 py-8 pb-24 sm:pb-8">
        {/* Header con quick stats */}
        <DashboardHeader
          metrics={metrics}
          onNewCandidate={() => {
            setEditingCandidate(null);
            setActiveTab("registro");
          }}
          onNewVacante={handleNewVacante}
        />

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab: Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Stats Summary */}
              <div className="space-y-4 rounded-2xl bg-white p-6 border border-teal-200">
                <h3 className="text-lg font-bold text-teal-900">Resumen</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-teal-50">
                    <span className="text-sm text-teal-700">Total Candidatos</span>
                    <span className="text-2xl font-bold text-teal-900">{metrics.total}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                    <span className="text-sm text-emerald-700">Disponibles Inmediatamente</span>
                    <span className="text-2xl font-bold text-emerald-600">{metrics.inmediatos}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50">
                    <span className="text-sm text-sky-700">Aprobados</span>
                    <span className="text-2xl font-bold text-sky-600">{metrics.aprobados}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                    <span className="text-sm text-amber-700">Score Promedio</span>
                    <span className="text-2xl font-bold text-amber-600">{metrics.promedio}%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4 rounded-2xl bg-white p-6 border border-teal-200">
                <h3 className="text-lg font-bold text-teal-900">Acciones Rápidas</h3>
                <div className="space-y-2 text-sm">
                  <button
                    onClick={() => setActiveTab("registro")}
                    className="w-full p-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium transition-colors text-left"
                  >
                    Registrar nuevo candidato
                  </button>
                  <button
                    onClick={() => setActiveTab("vacantes")}
                    className="w-full p-3 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-medium transition-colors text-left"
                  >
                    Crear nueva vacante
                  </button>
                  <button
                    onClick={() => setActiveTab("matching")}
                    className="w-full p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition-colors text-left"
                  >
                    Ver matching de vacantes
                  </button>
                  <button
                    onClick={() => setActiveTab("talento")}
                    className="w-full p-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium transition-colors text-left"
                  >
                    Explorar base de talento
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Talento */}
          <TabsContent value="talento">
            <TalentTab
              query={query}
              setQuery={setQuery}
              filterCity={filterCity}
              setFilterCity={setFilterCity}
              filterCargo={filterCargo}
              setFilterCargo={setFilterCargo}
              candidates={candidates}
              filtered={filtered}
              statusColor={statusColor}
              moveStatus={moveStatus}
              setEditingCandidate={setEditingCandidate}
              setActiveTab={setActiveTab}
              handleDelete={handleDelete}
              getCvUrl={getCvUrl}
              loadingIA={loadingIA}
              onAnalyzeCv={handleAnalyzeCv}
            />
          </TabsContent>

          {/* Tab: Registro */}
          <TabsContent value="registro">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-teal-200">
              <CandidateForm
                form={form}
                setForm={setForm}
                handleAdd={handleAdd}
                editingCandidate={editingCandidate}
              />
            </div>
          </TabsContent>

          {/* Tab: Vacantes */}
          <TabsContent value="vacantes">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <VacantesList
                  vacantes={vacantes}
                  selectedVacante={selectedVacante}
                  onSelect={handleSelectVacante}
                  onDelete={handleDeleteVacante}
                  onNew={handleNewVacante}
                  isLoading={vacanteLoading}
                />
              </div>
              <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-teal-200">
                <VacanteForm
                  form={vacanteForm}
                  setForm={setVacanteForm}
                  onSave={() => handleAddVacante(preguntas)}
                  onCancel={handleNewVacante}
                  isLoading={vacanteLoading}
                  preguntas={preguntas}
                  setPreguntas={setPreguntas}
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab: Matching */}
          <TabsContent value="matching">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-teal-200">
              <VacanteMatchingPanel vacante={selectedVacante} topCandidates={topCandidates} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

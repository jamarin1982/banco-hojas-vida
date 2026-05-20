import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, User, LogOut, Search, MapPin, Clock, DollarSign,
  Calendar, CheckCircle, AlertCircle, Loader2, ChevronRight,
  X, Filter, FileText, Star, Bell, Upload, Sparkles, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { usePortalVacantes } from "@/hooks/usePortalVacantes";
import {
  apiGetMiPerfil, apiUpdateMiPerfil, apiGetMisAplicaciones,
  apiSubirCvPerfil, apiAnalizarCvPerfil, apiAnalizarCvPerfilGemini, getCvPerfilUrl,
} from "@/services/authApi";
import { apiGetCandidatoStats } from "@/services/dashboardApi";
import { CandidatoMetrics } from "@/components/candidato/CandidatoMetrics";

// --- Sidebar candidato --------------------------------------------------------

const NAV_ITEMS = [
  { id: "vacantes", label: "Buscar Vacantes",   icon: Briefcase, activeStyle: { background: "linear-gradient(135deg,#1a3a6b,#1565c0)" } },
  { id: "perfil",   label: "Mi Perfil",         icon: User,      activeStyle: { background: "linear-gradient(135deg,#1565c0,#29b6f6)" } },
  { id: "mis-aplicaciones", label: "Mis Aplicaciones", icon: FileText, activeStyle: { background: "linear-gradient(135deg,#0d47a1,#1565c0)" } },
];

function CandidatoSidebar({ activeTab, onTabChange, user, onLogout }) {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:overflow-y-auto lg:flex lg:flex-col lg:border-r"
      style={{ background: "#0d2a52", borderColor: "#1a3a6b" }}>
      <div className="flex h-16 shrink-0 items-center border-b px-5" style={{ borderColor: "#1a3a6b" }}>
        <div className="flex items-center gap-2.5">
          <div style={{
              width: 65, height: 65, borderRadius: "14px", flexShrink: 0,
              background: "linear-gradient(135deg, #64d4f7 0%, #29b6f6 30%, #1565c0 65%, #0d2a52 100%)",
              padding: 4,
              boxShadow: "0 0 18px rgba(41,182,246,0.55), 0 3px 12px rgba(0,0,0,0.45)",
            }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: "10px",
                background: "white", display: "flex", alignItems: "center",
                justifyContent: "center", overflow: "hidden",
              }}>
                <img src="/logo-colba.png" alt="Grupo Colba"
                  style={{ width: "90%", height: "90%", objectFit: "contain" }} />
              </div>
            </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Colba Empleos</p>
            <p className="text-xs leading-tight" style={{ color: "#90caf9" }}>Portal Candidato</p>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1.5 px-3 py-5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all text-left"
              style={isActive
                ? { ...item.activeStyle, color: "white", boxShadow: "0 2px 8px rgba(21,101,192,0.4)" }
                : { color: "#90caf9" }
              }
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#1a3a6b"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-white opacity-80" />}
            </Motion.button>
          );
        })}
      </nav>
      <div className="border-t px-3 py-4 space-y-2" style={{ borderColor: "#1a3a6b" }}>
        <div className="rounded-lg p-3" style={{ background: "#1a3a6b" }}>
          <p className="text-xs font-semibold text-white truncate">{user?.nombre}</p>
          <p className="text-xs truncate" style={{ color: "#90caf9" }}>{user?.email}</p>
        </div>
        <button onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
          style={{ color: "#90caf9" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#1a3a6b"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#90caf9"; }}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function CandidatoMobileNav({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white lg:hidden" style={{ borderColor: "#e3f2fd" }}>
      <div className="flex justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium transition-all"
              style={{ color: isActive ? "#1565c0" : "#94a3b8" }}>
              <Icon className="h-5 w-5" />
              <span>{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Modal de aplicación ------------------------------------------------------

function ApplyModal({ vacante, applying, success, error, onApply, onClose }) {
  if (!vacante) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <Motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <Briefcase className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg leading-tight">{vacante.titulo}</h2>
              <p className="text-sm text-slate-500">{vacante.cargo} · {vacante.ciudad}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">¡Aplicación enviada!</h3>
                <p className="mt-2 text-slate-600 text-sm">
                  Tu perfil fue enviado para <span className="font-semibold text-purple-700">{vacante.titulo}</span>.
                  El equipo de reclutamiento revisará tu perfil pronto.
                </p>
              </div>
              <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">Cerrar</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div className="rounded-lg bg-slate-50 p-4 space-y-2 text-sm">
                <p className="font-semibold text-slate-700">Se enviará tu perfil actual para:</p>
                <div className="flex flex-wrap gap-3 text-slate-600">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{vacante.ciudad}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{vacante.experiencia_minima}-{vacante.experiencia_maxima} años</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{vacante.jornada}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Asegúrate de que tu perfil esté completo antes de aplicar.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onClose} disabled={applying}>Cancelar</Button>
                <Button onClick={onApply} disabled={applying} className="gap-2 bg-purple-600 hover:bg-purple-700">
                  {applying ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</> : <><ChevronRight className="h-4 w-4" />Confirmar aplicación</>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Motion.div>
    </div>
  );
}

// --- Tarjeta de vacante -------------------------------------------------------

function VacanteCard({ vacante, onApply, index }) {
  const [expanded, setExpanded] = useState(false);
  const salario = vacante.salario_minimo && vacante.salario_maximo
    ? `$${Number(vacante.salario_minimo).toLocaleString("es-CO")} - $${Number(vacante.salario_maximo).toLocaleString("es-CO")}`
    : vacante.salario_minimo ? `Desde $${Number(vacante.salario_minimo).toLocaleString("es-CO")}` : null;

  return (
    <Motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100">
              <Briefcase className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 leading-tight truncate">{vacante.titulo}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{vacante.cargo}</p>
            </div>
          </div>
          <Badge className="shrink-0 bg-green-50 text-green-700 border-green-200 border">{vacante.estado}</Badge>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{vacante.ciudad}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" />{vacante.experiencia_minima}-{vacante.experiencia_maxima} años</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" />{vacante.jornada}</span>
          {salario && <span className="flex items-center gap-1.5 text-emerald-700 font-medium"><DollarSign className="h-3.5 w-3.5" />{salario}</span>}
        </div>
        {vacante.certificaciones_requeridas?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {vacante.certificaciones_requeridas.slice(0, 4).map((cert, i) => (
              <Badge key={i} variant="secondary" className="text-xs bg-slate-100 text-slate-700 border-0">{cert}</Badge>
            ))}
            {vacante.certificaciones_requeridas.length > 4 && (
              <Badge variant="outline" className="text-xs text-slate-500">+{vacante.certificaciones_requeridas.length - 4} mas</Badge>
            )}
          </div>
        )}
        {vacante.descripcion && (
          <div>
            <p className={`text-sm text-slate-600 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>{vacante.descripcion}</p>
            {vacante.descripcion.length > 120 && (
              <button onClick={() => setExpanded(!expanded)} className="mt-1 text-xs text-purple-600 hover:text-purple-700 font-medium">
                {expanded ? "Ver menos" : "Ver mas"}
              </button>
            )}
          </div>
        )}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-500">Disponibilidad: <span className="font-medium text-slate-700">{vacante.disponibilidad}</span></span>
          <Button onClick={() => onApply(vacante)} size="sm" className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white">
            Aplicar <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Motion.div>
  );
}

// --- Tab: Buscar Vacantes -----------------------------------------------------

function TabVacantes() {
  const {
    vacantes, filtered, loading, error,
    searchQuery, setSearchQuery,
    filterCiudad, setFilterCiudad,
    filterCargo, setFilterCargo,
    filterJornada, setFilterJornada,
    filterDisponibilidad, setFilterDisponibilidad,
    filterExperiencia, setFilterExperiencia,
    ciudades, cargos, jornadas, disponibilidades,
    hasActiveFilters, clearFilters,
    selectedVacante, applying, applySuccess, applyError,
    openApplyModal, closeApplyModal, handleApply,
  } = usePortalVacantes();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 p-6 text-white shadow-lg">
        <h2 className="text-xl font-bold">Vacantes disponibles</h2>
        <p className="text-purple-200 text-sm mt-1">{vacantes.length} oportunidades activas</p>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cargo, ciudad, certificación..." className="pl-9 pr-9" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            { label: "Ciudad", value: filterCiudad, set: setFilterCiudad, opts: ciudades, placeholder: "Todas las ciudades" },
            { label: "Cargo", value: filterCargo, set: setFilterCargo, opts: cargos, placeholder: "Todos los cargos" },
            { label: "Jornada", value: filterJornada, set: setFilterJornada, opts: jornadas, placeholder: "Cualquier jornada" },
            { label: "Disponibilidad", value: filterDisponibilidad, set: setFilterDisponibilidad, opts: disponibilidades, placeholder: "Cualquier disponibilidad" },
          ].map(({ label, value, set, opts, placeholder }) => (
            <div key={label} className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</Label>
              <select value={value} onChange={(e) => set(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="all">{placeholder}</option>
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mis años exp.</Label>
            <select value={filterExperiencia} onChange={(e) => setFilterExperiencia(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="all">Cualquier nivel</option>
              {["0","1","2","3","5","8","10"].map((v) => <option key={v} value={v}>{v === "0" ? "Sin experiencia" : `${v} años`}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <p className="text-sm text-slate-500">Mostrando <span className="font-semibold text-slate-800">{filtered.length}</span> de <span className="font-semibold text-slate-800">{vacantes.length}</span> vacantes</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium">
              <X className="h-3.5 w-3.5" />Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {loading && <div className="flex items-center justify-center py-16 gap-3 text-slate-500"><Loader2 className="h-6 w-6 animate-spin text-purple-500" /><span>Cargando vacantes...</span></div>}
      {error && !loading && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-5">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {!loading && !error && (
        filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Filter className="h-8 w-8 text-slate-300" />
              <p className="font-semibold text-slate-700">No hay vacantes con esos filtros</p>
              {hasActiveFilters && <Button variant="outline" onClick={clearFilters} className="mt-2 gap-2"><X className="h-4 w-4" />Limpiar filtros</Button>}
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((v, i) => <VacanteCard key={v.id} vacante={v} index={i} onApply={openApplyModal} />)}
          </div>
        )
      )}

      <AnimatePresence>
        {selectedVacante && (
          <ApplyModal vacante={selectedVacante} applying={applying} success={applySuccess}
            error={applyError} onApply={handleApply} onClose={closeApplyModal} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Tab: Mi Perfil -----------------------------------------------------------

function TabPerfil({ token }) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);

  // CV
  const [cvFile, setCvFile] = useState(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    apiGetMiPerfil(token)
      .then((p) => {
        setPerfil(p);
        setForm({
          ...p,
          certificaciones: Array.isArray(p.certificaciones)
            ? p.certificaciones.join(", ")
            : p.certificaciones || "",
        });
      })
      .catch(() => setError("No se pudo cargar tu perfil."))
      .finally(() => setLoading(false));
  }, [token]);

  const setField = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  // -- Subir CV ----------------------------------------------------------------
  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo no puede superar 5 MB.");
      return;
    }
    setCvFile(file);
    setError("");
    setCvUploaded(false);
  };

  const handleUploadCv = async () => {
    if (!cvFile) return;
    setUploadingCv(true);
    setError("");
    try {
      await apiSubirCvPerfil(token, cvFile);
      setCvUploaded(true);
      // Recargar perfil para obtener cv_path actualizado
      const updated = await apiGetMiPerfil(token);
      setPerfil(updated);
    } catch (err) {
      setError("Error al subir el CV: " + err.message);
    } finally {
      setUploadingCv(false);
    }
  };

  // -- Analizar CV con IA ------------------------------------------------------
  const handleAnalyze = async (useGemini = false) => {
    setAnalyzing(true);
    setAnalyzeMsg(useGemini ? "Enviando a Gemini AI..." : "Leyendo tu hoja de vida...");
    setError("");
    try {
      setAnalyzeMsg(useGemini ? "Gemini está analizando tu CV... (puede tardar hasta 30s)" : "Analizando con IA, esto puede tomar unos segundos...");
      const data = useGemini ? await apiAnalizarCvPerfilGemini(token) : await apiAnalizarCvPerfil(token);
      setAnalyzeMsg("¡Listo! Revisando los datos extraídos...");

      setForm((prev) => ({
        ...prev,
        nombre: data.nombre && data.nombre !== "Candidato" ? data.nombre : prev.nombre,
        ciudad: data.ciudad && data.ciudad !== "No especificada" ? data.ciudad : prev.ciudad,
        cargo: data.cargo && data.cargo !== "Sin especificar" ? data.cargo : prev.cargo,
        experiencia: data.experiencia > 0 ? String(data.experiencia) : prev.experiencia,
        certificaciones: Array.isArray(data.certificaciones) && data.certificaciones.length > 0
          ? data.certificaciones.join(", ")
          : prev.certificaciones,
        observaciones: data.resumen ? data.resumen.substring(0, 500) : prev.observaciones,
      }));

      setAnalyzeMsg(useGemini ? "Formulario completado con Gemini AI. Revisa y guarda." : "Formulario completado con los datos del CV. Revisa y guarda.");
      setTimeout(() => setAnalyzeMsg(""), 5000);
    } catch (err) {
      setError("Error al analizar el CV: " + err.message);
      setAnalyzeMsg("");
    } finally {
      setAnalyzing(false);
    }
  };

  // -- Guardar perfil ----------------------------------------------------------
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const updated = await apiUpdateMiPerfil(token, form);
      setPerfil(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
        <span>Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-6 text-white shadow-lg">
        <h2 className="text-xl font-bold">Mi Perfil</h2>
        <p className="text-teal-200 text-sm mt-1">
          Mantén tu perfil actualizado para mejorar tu matching con vacantes
        </p>
      </div>

      {/* -- Sección CV -- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-teal-600" />
          <h3 className="font-semibold text-slate-900">Hoja de Vida (PDF)</h3>
        </div>

        {/* CV actual */}
        {perfil?.cv_path && (
          <div className="flex items-center gap-3 rounded-lg bg-teal-50 border border-teal-200 p-3">
            <FileText className="h-5 w-5 text-teal-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-teal-800">CV cargado</p>
              <p className="text-xs text-teal-600 truncate">{perfil.cv_path.split("/").pop()}</p>
            </div>
            <a
              href={getCvPerfilUrl(perfil.cv_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 font-medium"
            >
              <Eye className="h-3.5 w-3.5" />
              Ver
            </a>
          </div>
        )}

        {/* Zona de carga */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFileSelect(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all ${
            dragOver
              ? "border-teal-400 bg-teal-50"
              : cvFile
              ? "border-teal-300 bg-teal-50/50"
              : "border-slate-300 hover:border-teal-300 hover:bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          <Upload className={`h-8 w-8 ${cvFile ? "text-teal-500" : "text-slate-400"}`} />
          {cvFile ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-teal-700">{cvFile.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {(cvFile.size / 1024).toFixed(0)} KB · Haz clic para cambiar
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                Arrastra tu CV aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF · Máximo 5 MB</p>
            </div>
          )}
        </div>

        {/* Botones de acción del CV */}
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={handleUploadCv}
            disabled={!cvFile || uploadingCv}
            variant="outline"
            className="gap-2 border-teal-300 text-teal-700 hover:bg-teal-50"
          >
            {uploadingCv ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Subiendo...</>
            ) : cvUploaded ? (
              <><CheckCircle className="h-4 w-4 text-teal-600" />CV subido</>
            ) : (
              <><Upload className="h-4 w-4" />Subir CV</>
            )}
          </Button>

          {/* Botón local oculto */}

          <Button
            type="button"
            onClick={() => handleAnalyze(true)}
            disabled={analyzing || (!perfil?.cv_path && !cvUploaded)}
            className="gap-2 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white"
          >
            {analyzing ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Analizando...</>
            ) : (
              <><Sparkles className="h-4 w-4" />Analizar con IA</>
            )}
          </Button>
        </div>

        {/* Mensaje de progreso del análisis */}
        <AnimatePresence>
          {analyzeMsg && (
            <Motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-start gap-2.5 rounded-lg p-3 text-sm ${
                analyzeMsg.startsWith("Formulario")
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-purple-50 border border-purple-200 text-purple-700"
              }`}
            >
              {analyzeMsg.startsWith("Formulario") ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0 mt-0.5" />
              )}
              <span>{analyzeMsg}</span>
            </Motion.div>
          )}
        </AnimatePresence>

        {!perfil?.cv_path && !cvUploaded && (
          <p className="text-xs text-slate-400">
            Primero sube tu CV y luego usa "Analizar con IA" para completar el formulario automáticamente.
          </p>
        )}
      </div>

      {/* Alertas globales */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 p-3">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2.5 rounded-lg bg-green-50 border border-green-200 p-3">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700 font-medium">Perfil actualizado correctamente</p>
        </div>
      )}

      {/* -- Formulario de perfil -- */}
      {form && (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Información personal</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Nombre completo</Label>
                <Input value={form.nombre || ""} onChange={(e) => setField("nombre", e.target.value)} placeholder="Juan Pérez" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Ciudad</Label>
                <Input value={form.ciudad || ""} onChange={(e) => setField("ciudad", e.target.value)} placeholder="Bogotá" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm font-medium">Cargo objetivo</Label>
                <Input value={form.cargo || ""} onChange={(e) => setField("cargo", e.target.value)} placeholder="Desarrollador Senior" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Experiencia y competencias</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Años de experiencia</Label>
                <Input type="number" min="0" value={form.experiencia || ""} onChange={(e) => setField("experiencia", e.target.value)} placeholder="3" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Aspiración salarial ($)</Label>
                <Input type="number" value={form.aspiracion || ""} onChange={(e) => setField("aspiracion", e.target.value)} placeholder="2500000" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm font-medium">Certificaciones</Label>
                <Input value={form.certificaciones || ""} onChange={(e) => setField("certificaciones", e.target.value)} placeholder="AWS, Scrum Master (separadas por coma)" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Disponibilidad</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Disponibilidad</Label>
                <Input value={form.disponibilidad || ""} onChange={(e) => setField("disponibilidad", e.target.value)} placeholder="Inmediata" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Jornada preferida</Label>
                <Input value={form.jornada || ""} onChange={(e) => setField("jornada", e.target.value)} placeholder="Completa" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm font-medium">Resumen / Observaciones</Label>
                <Textarea value={form.observaciones || ""} onChange={(e) => setField("observaciones", e.target.value)} placeholder="Cuéntanos sobre ti, tu experiencia y objetivos..." rows={4} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="gap-2 bg-teal-600 hover:bg-teal-700">
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Guardando...</>
              ) : (
                <><CheckCircle className="h-4 w-4" />Guardar perfil</>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

// --- Tab: Mis Aplicaciones ----------------------------------------------------

const ESTADO_COLORS = {
  "Aplico": "bg-slate-100 text-slate-700",
  "Aplicó": "bg-slate-100 text-slate-700",
  "Preseleccionado": "bg-blue-100 text-blue-700",
  "Entrevista": "bg-amber-100 text-amber-700",
  "Aprobado": "bg-green-100 text-green-700",
  "Contratado": "bg-emerald-100 text-emerald-700",
};

function TabMisAplicaciones({ token }) {
  const [aplicaciones, setAplicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGetMisAplicaciones(token)
      .then(setAplicaciones)
      .catch(() => setError("No se pudieron cargar tus aplicaciones."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex items-center justify-center py-16 gap-3 text-slate-500"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /><span>Cargando aplicaciones...</span></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-lg">
        <h2 className="text-xl font-bold">Mis Aplicaciones</h2>
        <p className="text-blue-200 text-sm mt-1">{aplicaciones.length} aplicaciones registradas</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-5">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!error && aplicaciones.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <FileText className="h-10 w-10 text-slate-300" />
            <p className="font-semibold text-slate-700">Aún no has aplicado a ninguna vacante</p>
            <p className="text-sm">Explora las vacantes disponibles y aplica a las que te interesen.</p>
          </div>
        </Card>
      )}

      {aplicaciones.length > 0 && (
        <div className="space-y-3">
          {aplicaciones.map((ap, i) => (
            <Motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{ap.titulo}</h3>
                    <p className="text-sm text-slate-500">{ap.cargo} · {ap.ciudad}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ESTADO_COLORS[ap.estado_aplicacion] || "bg-slate-100 text-slate-700"}`}>
                    {ap.estado_aplicacion}
                  </span>
                  {ap.score_total != null && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                      <Star className="h-3 w-3" />Match: {Math.round(ap.score_total)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{ap.jornada}</span>
                {ap.salario_minimo && <span className="flex items-center gap-1 text-emerald-600"><DollarSign className="h-3 w-3" />${Number(ap.salario_minimo).toLocaleString("es-CO")}</span>}
                <span className="flex items-center gap-1"><Bell className="h-3 w-3" />Vacante: {ap.vacante_estado}</span>
              </div>
            </Motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Dashboard principal candidato --------------------------------------------

export default function CandidatoDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("vacantes");
  const [candidatoStats, setCandidatoStats] = useState(null);

  useEffect(() => {
    if (token) {
      apiGetCandidatoStats(token)
        .then(setCandidatoStats)
        .catch(() => {});
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-purple-50 lg:pl-64">
      <CandidatoSidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout} />
      <CandidatoMobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="space-y-6 px-4 py-8 pb-24 sm:pb-8">
        <CandidatoMetrics stats={candidatoStats} />
        {activeTab === "vacantes" && <TabVacantes />}
        {activeTab === "perfil" && <TabPerfil token={token} />}
        {activeTab === "mis-aplicaciones" && <TabMisAplicaciones token={token} />}
      </main>
    </div>
  );
}

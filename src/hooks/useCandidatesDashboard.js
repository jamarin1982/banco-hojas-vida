import { useEffect, useMemo, useState } from "react";
import {
  analyzeCandidateCvGemini,
  createCandidate,
  deleteCandidate,
  enviarPruebaCandidato,
  fetchCandidates,
  mapCandidateToForm,
  updateCandidate,
  uploadCandidateCv,
} from "@/services/candidatosApi";
import { apiGetDashboardStats, apiGetCandidateMatches } from "@/services/dashboardApi";
import { useAuth } from "@/context/AuthContext";
import { EMPTY_CANDIDATE_FORM } from "@/features/candidatos/model";

export function useCandidatesDashboard() {
  const { token } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState("talento");
  const [query, setQuery] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [filterCargo, setFilterCargo] = useState("all");
  const [form, setForm] = useState(EMPTY_CANDIDATE_FORM);
  const [loadingIA, setLoadingIA] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [analyzeProgress, setAnalyzeProgress] = useState("");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [candidateMatches, setCandidateMatches] = useState({});

  useEffect(() => {
    fetchCandidates(pagination.page, pagination.limit)
      .then((result) => {
        setCandidates(result.data);
        setPagination((prev) => ({
          ...prev,
          total: result.total,
          totalPages: result.totalPages,
        }));
      })
      .catch((err) => console.error("Error cargando candidatos:", err));
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    if (token) {
      apiGetDashboardStats(token)
        .then((stats) => setDashboardStats(stats))
        .catch((err) => console.error("Error cargando stats dashboard:", err));
      apiGetCandidateMatches(token)
        .then((matches) => setCandidateMatches(matches))
        .catch((err) => console.error("Error cargando matches:", err));
    }
  }, [token]);

  useEffect(() => {
    setForm(editingCandidate ? mapCandidateToForm(editingCandidate) : EMPTY_CANDIDATE_FORM);
  }, [editingCandidate]);

  const enriched = useMemo(() => {
    return candidates.map((candidate) => {
      const match = candidateMatches[candidate.id];
      return {
        ...candidate,
        score: match?.score || 0,
        mejorMatchVacante: match?.vacante || null,
        mejorMatchVacanteId: match?.vacanteId || null,
      };
    });
  }, [candidates, candidateMatches]);

  const filtered = useMemo(() => {
    return enriched
      .filter((candidate) => {
        const matchesText =
          !query ||
          [candidate.nombre, candidate.ciudad, candidate.cargo, candidate.observaciones, ...(candidate.certificaciones || [])]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesCity = filterCity === "all" || candidate.ciudad === filterCity;
        const matchesCargo = filterCargo === "all" || candidate.cargo === filterCargo;
        return matchesText && matchesCity && matchesCargo;
      })
      .sort((a, b) => b.score - a.score);
  }, [enriched, query, filterCity, filterCargo]);

  const metrics = useMemo(() => {
    const ds = dashboardStats;
    const total = ds ? ds.totalCandidatos : candidates.length;
    const inmediatos = ds ? ds.inmediatos : candidates.filter((c) => c.disponibilidad === "Inmediata").length;
    const aprobados = ds ? ds.aprobados : candidates.filter((c) => ["Aprobado", "Contratado"].includes(c.estado)).length;
    const scorePromedio = ds ? ds.scorePromedio : (total ? Math.round(enriched.reduce((acc, c) => acc + c.score, 0) / total) : 0);

    return {
      totalCandidatos: total,
      inmediatos,
      aprobados,
      scorePromedio,
      vacantesActivas: ds?.vacantesActivas || 0,
      vacantesSinPostulantes: ds?.vacantesSinPostulantes || 0,
      aplicacionesRecientes: ds?.aplicacionesRecientes || 0,
      matchAlto: ds?.matchAlto || 0,
      embudoAplicaciones: ds?.embudoAplicaciones || {},
      vacantesPorEstado: ds?.vacantesPorEstado || {},
      scorePorVacante: ds?.scorePorVacante || [],
      desgloseScores: ds?.desgloseScores || {},
      topCiudades: ds?.topCiudades || [],
      vacConPreguntas: ds?.vacConPreguntas || 0,
      candConCv: ds?.candConCv || 0,
      topVacantes: ds?.topVacantes || [],
    };
  }, [candidates, enriched, dashboardStats]);

  const handleAdd = async () => {
    if (!form.nombre || !form.ciudad || !form.cargo) return;

    const payload = {
      ...form,
      experiencia: Number(form.experiencia || 0),
      aspiracion: Number(form.aspiracion || 0),
      certificaciones: form.certificaciones,
      estado: editingCandidate ? editingCandidate.estado : "Aplicó",
    };

    let candidateId;

    if (editingCandidate) {
      candidateId = editingCandidate.id;
      await updateCandidate(candidateId, payload);
    } else {
      const data = await createCandidate(payload);
      candidateId = data.id;
    }

    if (form.cv && candidateId) {
      await uploadCandidateCv(candidateId, form.cv);
    }

    const updatedCandidates = await fetchCandidates(pagination.page, pagination.limit);
    setCandidates(updatedCandidates.data);
    setPagination((prev) => ({
      ...prev,
      total: updatedCandidates.total,
      totalPages: updatedCandidates.totalPages,
    }));
    setEditingCandidate(null);
    setActiveTab("talento");
    setForm(EMPTY_CANDIDATE_FORM);
    return candidateId;
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este candidato?")) return;

    await deleteCandidate(id);
    setCandidates((prev) => prev.filter((candidate) => candidate.id !== id));
  };

  const moveStatus = async (id, next, vacanteId, testLink) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, estado: next } : c)));

    if (next === "Entrevista" && vacanteId) {
      try {
        await enviarPruebaCandidato(id, vacanteId, testLink || "https://forms.gle/default-test");
      } catch (err) {
        console.error("Error enviando prueba:", err);
      }
    }
  };

  const handleAnalyzeCv = async (candidate) => {
    setLoadingIA(true);
    setAnalyzeError(null);
    setAnalyzeProgress("Analizando datos...");

    try {
      const data = await analyzeCandidateCvGemini(candidate.id);

      console.log("🔍 Datos recibidos del servidor:", data);

      // Validar que se recibieron datos
      if (!data || Object.keys(data).length === 0) {
        throw new Error("El servidor devolvió una respuesta vacía");
      }

      console.log("✅ Datos válidos recibidos, rellenando formulario");

      // IMPORTANTE: Actualizar form PRIMERO
      setForm((prev) => {
        const newForm = {
          ...prev,
          nombre: data.nombre?.trim() || prev.nombre || "Candidato",
          ciudad: data.ciudad?.trim() || prev.ciudad || "",
          cargo: data.cargo?.trim() || prev.cargo || "",
          experiencia: String(data.experiencia || 0),
          certificaciones: Array.isArray(data.certificaciones)
            ? data.certificaciones.join(", ")
            : (data.certificaciones || ""),
          observaciones: (data.resumen || "").substring(0, 500),
        };
        console.log("📋 Nuevo formulario:", newForm);
        return newForm;
      });

      // Cambiar a tab registro
      console.log("🔀 Cambiando a tab registro...");
      setActiveTab("registro");
      
      // NO setear editingCandidate aquí para no triggerizar el useEffect que resetea el form
      // setEditingCandidate(candidate);
      
      // Limpiar notificación de progreso inmediatamente
      setAnalyzeProgress("");
    } catch (error) {
      const errorMessage =
        error?.message ||
        "Error al analizar el CV. Verifica que el motriz de IA esté funcionando.";
      setAnalyzeError(errorMessage);
      console.error("Error analizando CV:", error);
      // Limpiar progreso en error también
      setAnalyzeProgress("");
    } finally {
      setLoadingIA(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    candidates,
    pagination,
    setPagination,
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
    dashboardStats,
    handleAdd,
    handleDelete,
    moveStatus,
    handleAnalyzeCv,
  };
}

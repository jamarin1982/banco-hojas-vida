import { useEffect, useMemo, useState } from "react";
import { fetchVacantes, applyToVacante } from "@/services/vacantesApi";
import { apiGetPreguntas, apiSaveRespuestas } from "@/services/preguntasApi";
import { useAuth } from "@/context/AuthContext";

export function usePortalVacantes() {
  const { token } = useAuth();

  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCiudad, setFilterCiudad] = useState("all");
  const [filterCargo, setFilterCargo] = useState("all");
  const [filterJornada, setFilterJornada] = useState("all");
  const [filterDisponibilidad, setFilterDisponibilidad] = useState("all");
  const [filterExperiencia, setFilterExperiencia] = useState("all");

  // Modal de aplicación
  const [selectedVacante, setSelectedVacante] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState(null);

  // Preguntas de la vacante seleccionada
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  useEffect(() => {
    loadVacantes();
  }, []);

  const loadVacantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVacantes("Activa");
      setVacantes(data);
    } catch {
      setError("No se pudieron cargar las vacantes. Verifica la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const ciudades = useMemo(() => [...new Set(vacantes.map((v) => v.ciudad).filter(Boolean))].sort(), [vacantes]);
  const cargos = useMemo(() => [...new Set(vacantes.map((v) => v.cargo).filter(Boolean))].sort(), [vacantes]);
  const jornadas = useMemo(() => [...new Set(vacantes.map((v) => v.jornada).filter(Boolean))].sort(), [vacantes]);
  const disponibilidades = useMemo(() => [...new Set(vacantes.map((v) => v.disponibilidad).filter(Boolean))].sort(), [vacantes]);

  const filtered = useMemo(() => {
    return vacantes.filter((v) => {
      const matchesText =
        !searchQuery ||
        [v.titulo, v.cargo, v.ciudad, v.descripcion, ...(v.certificaciones_requeridas || [])]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesCiudad = filterCiudad === "all" || v.ciudad === filterCiudad;
      const matchesCargo = filterCargo === "all" || v.cargo === filterCargo;
      const matchesJornada = filterJornada === "all" || v.jornada === filterJornada;
      const matchesDisponibilidad = filterDisponibilidad === "all" || v.disponibilidad === filterDisponibilidad;

      let matchesExperiencia = true;
      if (filterExperiencia !== "all") {
        const exp = parseInt(filterExperiencia);
        matchesExperiencia = exp >= (v.experiencia_minima || 0) && exp <= (v.experiencia_maxima || 99);
      }

      return matchesText && matchesCiudad && matchesCargo && matchesJornada && matchesDisponibilidad && matchesExperiencia;
    });
  }, [vacantes, searchQuery, filterCiudad, filterCargo, filterJornada, filterDisponibilidad, filterExperiencia]);

  const openApplyModal = async (vacante) => {
    setSelectedVacante(vacante);
    setApplySuccess(false);
    setApplyError(null);
    setRespuestas({});

    // Cargar preguntas de la vacante
    try {
      const data = await apiGetPreguntas(vacante.id);
      setPreguntas(data);
    } catch (err) {
      console.error("Error cargando preguntas:", err);
      setPreguntas([]);
    }
  };

  const closeApplyModal = () => {
    setSelectedVacante(null);
    setApplySuccess(false);
    setApplyError(null);
    setPreguntas([]);
    setRespuestas({});
  };

  const handleApply = async (candidatoId) => {
    try {
      setApplying(true);
      setApplyError(null);

      // Guardar respuestas a preguntas si hay
      if (preguntas.length > 0 && candidatoId) {
        const respuestasArray = preguntas
          .filter((p) => respuestas[p.id])
          .map((p) => ({
            preguntaId: p.id,
            respuesta: respuestas[p.id],
          }));

        if (respuestasArray.length > 0) {
          await apiSaveRespuestas(candidatoId, selectedVacante.id, respuestasArray);
        }
      }

      await applyToVacante(selectedVacante.id, token);
      setApplySuccess(true);
    } catch (err) {
      setApplyError(err.message || "Ocurrió un error al enviar tu aplicación. Intenta de nuevo.");
    } finally {
      setApplying(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCiudad("all");
    setFilterCargo("all");
    setFilterJornada("all");
    setFilterDisponibilidad("all");
    setFilterExperiencia("all");
  };

  const hasActiveFilters =
    searchQuery || filterCiudad !== "all" || filterCargo !== "all" ||
    filterJornada !== "all" || filterDisponibilidad !== "all" || filterExperiencia !== "all";

  return {
    vacantes, filtered, loading, error,
    searchQuery, setSearchQuery,
    filterCiudad, setFilterCiudad,
    filterCargo, setFilterCargo,
    filterJornada, setFilterJornada,
    filterDisponibilidad, setFilterDisponibilidad,
    filterExperiencia, setFilterExperiencia,
    ciudades, cargos, jornadas, disponibilidades,
    hasActiveFilters, clearFilters,
    selectedVacante,
    applying, applySuccess, applyError,
    openApplyModal, closeApplyModal, handleApply,
    preguntas,
    respuestas, setRespuestas,
  };
}

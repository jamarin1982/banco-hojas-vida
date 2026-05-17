import { useState, useEffect } from "react";
import {
  fetchVacantes,
  fetchVacanteById,
  createVacante,
  updateVacante,
  deleteVacante,
  fetchTopCandidatesForVacante,
} from "@/services/vacantesApi";
import { apiCreatePregunta, apiUpdatePregunta, apiDeletePregunta, apiGetPreguntas } from "@/services/preguntasApi";
import { useAuth } from "@/context/AuthContext";

const EMPTY_VACANTE_FORM = {
  titulo: "",
  descripcion: "",
  cargo: "",
  ciudad: "",
  experiencia_minima: 0,
  experiencia_maxima: 10,
  certificaciones_requeridas: [],
  disponibilidad: "Inmediata",
  jornada: "Completa",
  salario_minimo: "",
  salario_maximo: "",
  estado: "Activa",
};

export function useVacantesManager() {
  const { token } = useAuth();
  const [vacantes, setVacantes] = useState([]);
  const [selectedVacante, setSelectedVacante] = useState(null);
  const [topCandidates, setTopCandidates] = useState([]);
  const [form, setForm] = useState(EMPTY_VACANTE_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preguntas, setPreguntas] = useState([]);

  // Cargar vacantes
  useEffect(() => {
    loadVacantes();
  }, []);

  // Cargar candidatos cuando se selecciona una vacante
  useEffect(() => {
    if (selectedVacante) {
      loadTopCandidates(selectedVacante.id);
    }
  }, [selectedVacante]);

  const loadVacantes = async () => {
    try {
      setLoading(true);
      const data = await fetchVacantes("Activa");
      setVacantes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error cargando vacantes:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopCandidates = async (vacanteId) => {
    try {
      const data = await fetchTopCandidatesForVacante(vacanteId, 15);
      setTopCandidates(data);
    } catch (err) {
      console.error("Error cargando candidatos sugeridos:", err);
    }
  };

  const handleAddVacante = async (preguntasData = []) => {
    if (!form.titulo || !form.cargo || !form.ciudad) {
      setError("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setLoading(true);
      let vacanteId;
      if (selectedVacante) {
        await updateVacante(selectedVacante.id, form);
        vacanteId = selectedVacante.id;
      } else {
        const nueva = await createVacante(form);
        vacanteId = nueva.id || nueva.insertId;
      }

      // Guardar preguntas
      if (token && preguntasData.length > 0) {
        for (const p of preguntasData) {
          if (p.id && !p.id.toString().startsWith("temp-")) {
            // Pregunta existente - actualizar
            await apiUpdatePregunta(token, p.id, { tipo: p.tipo, pregunta: p.pregunta, orden: p.orden });
          } else {
            // Pregunta nueva - crear
            await apiCreatePregunta(token, vacanteId, { tipo: p.tipo, pregunta: p.pregunta, orden: p.orden });
          }
        }
      }

      await loadVacantes();
      setForm(EMPTY_VACANTE_FORM);
      setSelectedVacante(null);
      setPreguntas([]);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVacante = async (id) => {
    if (!confirm("¿Eliminar esta vacante?")) return;

    try {
      setLoading(true);
      await deleteVacante(id);
      await loadVacantes();
      setSelectedVacante(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVacante = async (vacante) => {
    setSelectedVacante(vacante);
    setForm(vacante);
    // Cargar preguntas de la vacante seleccionada
    if (token) {
      try {
        const data = await apiGetPreguntas(vacante.id);
        setPreguntas(data);
      } catch (err) {
        console.error("Error cargando preguntas:", err);
        setPreguntas([]);
      }
    }
  };

  const handleNewVacante = () => {
    setSelectedVacante(null);
    setForm(EMPTY_VACANTE_FORM);
    setPreguntas([]);
  };

  return {
    vacantes,
    selectedVacante,
    topCandidates,
    form,
    setForm,
    loading,
    error,
    handleAddVacante,
    handleDeleteVacante,
    handleSelectVacante,
    handleNewVacante,
    loadVacantes,
    loadTopCandidates,
    preguntas,
    setPreguntas,
  };
}

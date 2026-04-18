import { useState, useEffect } from "react";
import {
  fetchVacantes,
  fetchVacanteById,
  createVacante,
  updateVacante,
  deleteVacante,
  fetchTopCandidatesForVacante,
} from "@/services/vacantesApi";

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
  const [vacantes, setVacantes] = useState([]);
  const [selectedVacante, setSelectedVacante] = useState(null);
  const [topCandidates, setTopCandidates] = useState([]);
  const [form, setForm] = useState(EMPTY_VACANTE_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleAddVacante = async () => {
    if (!form.titulo || !form.cargo || !form.ciudad) {
      setError("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setLoading(true);
      if (selectedVacante) {
        await updateVacante(selectedVacante.id, form);
      } else {
        await createVacante(form);
      }
      await loadVacantes();
      setForm(EMPTY_VACANTE_FORM);
      setSelectedVacante(null);
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
  };

  const handleNewVacante = () => {
    setSelectedVacante(null);
    setForm(EMPTY_VACANTE_FORM);
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
  };
}

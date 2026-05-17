import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, Loader2, CheckCircle, AlertCircle, Plus, MessageSquare, Trash2 } from "lucide-react";
import { generateVacantePerfil } from "@/services/vacantesApi";
import { apiGenerarPreguntas, apiCreatePregunta, apiUpdatePregunta, apiDeletePregunta, apiGetPreguntas } from "@/services/preguntasApi";
import { useAuth } from "@/context/AuthContext";

export function VacanteForm({ form, setForm, onSave, onCancel, isLoading, preguntas, setPreguntas }) {
  const { token } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [generatedPerfil, setGeneratedPerfil] = useState(null);
  const [editablePerfil, setEditablePerfil] = useState(null);
  const [generateError, setGenerateError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [perfilApplied, setPerfilApplied] = useState(false);

  // Preguntas
  const [generatingPreguntas, setGeneratingPreguntas] = useState(false);
  const [preguntasError, setPreguntasError] = useState("");
  const [showPreguntasSection, setShowPreguntasSection] = useState(false);

  // Usar preguntas del prop o estado local
  const preguntasState = preguntas || [];
  const setPreguntasState = setPreguntas || setPreguntas;

  const handleGeneratePerfil = async () => {
    if (!form.descripcion?.trim()) {
      setGenerateError("Escribí una descripción para generar el perfil.");
      return;
    }
    setGenerating(true);
    setGenerateError("");
    setGeneratedPerfil(null);
    try {
      const perfil = await generateVacantePerfil({
        descripcion: form.descripcion,
        titulo: form.titulo,
        cargo: form.cargo,
        ciudad: form.ciudad,
      });
      setGeneratedPerfil(perfil);
      setEditablePerfil(JSON.parse(JSON.stringify(perfil)));
      setShowPreview(true);
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleEditField = (field, value) => {
    setEditablePerfil((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditArrayItem = (field, index, value) => {
    setEditablePerfil((prev) => {
      const arr = [...(prev[field] || [])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleAddArrayItem = (field) => {
    setEditablePerfil((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const handleRemoveArrayItem = (field, index) => {
    setEditablePerfil((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  const handleApplyGenerated = () => {
    if (!editablePerfil) return;
    setForm({
      ...form,
      titulo: editablePerfil.titulo || form.titulo,
      cargo: editablePerfil.cargo || form.cargo,
      ciudad: editablePerfil.ciudad || form.ciudad,
      descripcion: editablePerfil.resumen || editablePerfil.descripcion || form.descripcion,
      resumen: editablePerfil.resumen || "",
      responsabilidades: editablePerfil.responsabilidades || [],
      requisitos: editablePerfil.requisitos || [],
      ofrecemos: editablePerfil.ofrecemos || [],
      experiencia_minima: editablePerfil.experiencia_minima ?? form.experiencia_minima,
      experiencia_maxima: editablePerfil.experiencia_maxima ?? form.experiencia_maxima,
      certificaciones_requeridas: editablePerfil.certificaciones_requeridas?.length > 0
        ? editablePerfil.certificaciones_requeridas.filter(Boolean)
        : form.certificaciones_requeridas,
      jornada: editablePerfil.jornada || form.jornada,
      disponibilidad: editablePerfil.disponibilidad || form.disponibilidad,
      salario_minimo: editablePerfil.salario_minimo || form.salario_minimo,
      salario_maximo: editablePerfil.salario_maximo || form.salario_maximo,
    });
    setShowPreview(false);
    setGeneratedPerfil(null);
    setEditablePerfil(null);
    setPerfilApplied(true);
  };

  const handleDiscardGenerated = () => {
    setShowPreview(false);
    setGeneratedPerfil(null);
    setEditablePerfil(null);
  };

  // Preguntas handlers
  const handleGeneratePreguntas = async () => {
    if (!token) {
      setPreguntasError("Debes estar autenticado para generar preguntas.");
      return;
    }
    if (!form.titulo?.trim() && !form.descripcion?.trim()) {
      setPreguntasError("Completá al menos el título o descripción para generar preguntas.");
      return;
    }
    setGeneratingPreguntas(true);
    setPreguntasError("");
    try {
      const nuevas = await apiGenerarPreguntas(token, {
        titulo: form.titulo,
        cargo: form.cargo,
        ciudad: form.ciudad,
        descripcion: form.descripcion,
        requisitos: form.requisitos?.join(", "),
        experiencia_minima: form.experiencia_minima,
      });
      setPreguntas(nuevas);
      setShowPreguntasSection(true);
    } catch (err) {
      setPreguntasError(err.message);
    } finally {
      setGeneratingPreguntas(false);
    }
  };

  const handleAddPregunta = (tipo) => {
    const nueva = {
      id: `temp-${Date.now()}`,
      vacante_id: form.id || null,
      tipo,
      pregunta: "",
      orden: preguntasState.filter((p) => p.tipo === tipo).length + 1,
    };
    setPreguntasState([...preguntasState, nueva]);
  };

  const handleUpdatePregunta = (id, field, value) => {
    setPreguntasState(preguntasState.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleDeletePregunta = async (pregunta) => {
    if (pregunta.id && !pregunta.id.toString().startsWith("temp-") && token) {
      try {
        await apiDeletePregunta(token, pregunta.id);
      } catch (err) {
        console.error("Error eliminando pregunta:", err);
      }
    }
    setPreguntasState(preguntasState.filter((p) => p.id !== pregunta.id));
  };

  const getPreguntasByTipo = (tipo) => preguntasState.filter((p) => p.tipo === tipo);

  const tipoConfig = {
    informativa: { label: "Informativas", color: "blue", icon: "💬", desc: "Para conocer mejor al candidato" },
    calificatoria: { label: "Calificatorias", color: "amber", icon: "⭐", desc: "Evalúan competencias clave" },
    excluyente: { label: "Excluyentes", color: "red", icon: "🚫", desc: "Respuesta Sí/No - pueden descartar candidatos" },
  };

  const handleFormArrayItem = (field, index, value) => {
    setForm((prev) => {
      const arr = [...(prev[field] || [])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleFormAddArrayItem = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const handleFormRemoveArrayItem = (field, index) => {
    setForm((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-bold text-slate-900">
        {form.id ? "Editar Vacante" : "Nueva Vacante"}
      </h3>

      {/* Campos básicos para contexto de IA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título de la Posición *</Label>
          <Input
            id="titulo"
            placeholder="Ej: Senior Full Stack Developer"
            value={form.titulo || ""}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            disabled={perfilApplied}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cargo">Cargo *</Label>
          <Input
            id="cargo"
            placeholder="Ej: DESARROLLADOR"
            value={form.cargo || ""}
            onChange={(e) => setForm({ ...form, cargo: e.target.value })}
            disabled={perfilApplied}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad *</Label>
          <Input
            id="ciudad"
            placeholder="Ej: Barranquilla"
            value={form.ciudad || ""}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            disabled={perfilApplied}
          />
        </div>
      </div>

      {/* Descripción para generar perfil con IA */}
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          placeholder="Detallá los requisitos, responsabilidades y beneficios..."
          value={form.descripcion || ""}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          rows={4}
          disabled={perfilApplied}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleGeneratePerfil}
          disabled={generating || !form.descripcion?.trim() || perfilApplied}
          className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          {generating ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Generando perfil...</>
          ) : perfilApplied ? (
            <><CheckCircle className="h-4 w-4 text-green-600" />Perfil aplicado</>
          ) : (
            <><Sparkles className="h-4 w-4" />Generar perfil con IA</>
          )}
        </Button>
        {generateError && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {generateError}
          </div>
        )}
      </div>

      {/* Preview editable del perfil generado */}
      {showPreview && editablePerfil && (
        <Card className="p-5 space-y-5 border-blue-200 bg-blue-50/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900 text-lg">Ficha profesional generada por IA</h4>
          </div>
          <p className="text-sm text-blue-700">
            Editá los campos antes de aplicarlos al formulario.
          </p>

          {/* Título del cargo */}
          <div className="bg-white rounded-lg p-4 border border-blue-100 space-y-3">
            <Label className="text-xs font-semibold text-blue-600 uppercase">Título del cargo</Label>
            <Input
              value={editablePerfil.titulo || ""}
              onChange={(e) => handleEditField("titulo", e.target.value)}
              className="font-bold text-lg"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-500">Cargo</Label>
                <Input value={editablePerfil.cargo || ""} onChange={(e) => handleEditField("cargo", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Ciudad</Label>
                <Input value={editablePerfil.ciudad || ""} onChange={(e) => handleEditField("ciudad", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-white rounded-lg p-4 border border-blue-100 space-y-2">
            <Label className="text-xs font-semibold text-blue-600 uppercase">Resumen del cargo</Label>
            <Textarea
              value={editablePerfil.resumen || ""}
              onChange={(e) => handleEditField("resumen", e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Responsabilidades */}
          <div className="bg-white rounded-lg p-4 border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-blue-600 uppercase">Responsabilidades</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleAddArrayItem("responsabilidades")} className="h-6 text-xs text-blue-600">
                <Plus className="h-3 w-3 mr-1" /> Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {(editablePerfil.responsabilidades || []).map((resp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-blue-500 text-sm flex-shrink-0">•</span>
                  <Input
                    value={resp}
                    onChange={(e) => handleEditArrayItem("responsabilidades", i, e.target.value)}
                    className="text-sm"
                  />
                  <button type="button" onClick={() => handleRemoveArrayItem("responsabilidades", i)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Requisitos */}
          <div className="bg-white rounded-lg p-4 border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-blue-600 uppercase">Requisitos</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleAddArrayItem("requisitos")} className="h-6 text-xs text-blue-600">
                <Plus className="h-3 w-3 mr-1" /> Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {(editablePerfil.requisitos || []).map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-amber-500 text-sm flex-shrink-0">✓</span>
                  <Input
                    value={req}
                    onChange={(e) => handleEditArrayItem("requisitos", i, e.target.value)}
                    className="text-sm"
                  />
                  <button type="button" onClick={() => handleRemoveArrayItem("requisitos", i)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Ofrecemos */}
          <div className="bg-white rounded-lg p-4 border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-blue-600 uppercase">Ofrecemos</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleAddArrayItem("ofrecemos")} className="h-6 text-xs text-blue-600">
                <Plus className="h-3 w-3 mr-1" /> Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {(editablePerfil.ofrecemos || []).map((oferta, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-green-500 text-sm flex-shrink-0">★</span>
                  <Input
                    value={oferta}
                    onChange={(e) => handleEditArrayItem("ofrecemos", i, e.target.value)}
                    className="text-sm"
                  />
                  <button type="button" onClick={() => handleRemoveArrayItem("ofrecemos", i)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Datos técnicos */}
          <div className="bg-white rounded-lg p-4 border border-blue-100 space-y-3">
            <Label className="text-xs font-semibold text-blue-600 uppercase">Datos técnicos</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Exp. mínima</Label>
                <Input type="number" min="0" value={editablePerfil.experiencia_minima ?? 0} onChange={(e) => handleEditField("experiencia_minima", parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Exp. máxima</Label>
                <Input type="number" min="0" value={editablePerfil.experiencia_maxima ?? 10} onChange={(e) => handleEditField("experiencia_maxima", parseInt(e.target.value) || 10)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Jornada</Label>
                <select value={editablePerfil.jornada || "Completa"} onChange={(e) => handleEditField("jornada", e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                  <option value="Completa">Completa</option>
                  <option value="Media Jornada">Media Jornada</option>
                  <option value="Por Proyecto">Por Proyecto</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Disponibilidad</Label>
                <select value={editablePerfil.disponibilidad || "Inmediata"} onChange={(e) => handleEditField("disponibilidad", e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                  <option value="Inmediata">Inmediata</option>
                  <option value="15 días">15 días</option>
                  <option value="30 días">30 días</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Salario mínimo</Label>
                <Input type="number" value={editablePerfil.salario_minimo || ""} onChange={(e) => handleEditField("salario_minimo", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Salario máximo</Label>
                <Input type="number" value={editablePerfil.salario_maximo || ""} onChange={(e) => handleEditField("salario_maximo", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-500">Certificaciones sugeridas</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleAddArrayItem("certificaciones_requeridas")} className="h-6 text-xs text-blue-600">
                  <Plus className="h-3 w-3 mr-1" /> Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(editablePerfil.certificaciones_requeridas || []).map((cert, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-2 rounded-full flex items-center gap-1">
                    <Input
                      value={cert}
                      onChange={(e) => handleEditArrayItem("certificaciones_requeridas", i, e.target.value)}
                      className="bg-transparent border-0 shadow-none p-0 h-auto text-xs w-24"
                    />
                    <button type="button" onClick={() => handleRemoveArrayItem("certificaciones_requeridas", i)} className="hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={handleDiscardGenerated}>
              Descartar
            </Button>
            <Button onClick={handleApplyGenerated} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <CheckCircle className="h-4 w-4" />
              Aplicar al formulario
            </Button>
          </div>
        </Card>
      )}

      {/* Campos editables después de aplicar el perfil de IA */}
      {perfilApplied && (
        <Card className="p-5 space-y-5 border-green-200 bg-green-50/50">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900 text-lg">Perfil de la vacante</h4>
          </div>
          <p className="text-sm text-green-700">
            Podés editar cualquier campo antes de guardar.
          </p>

          {/* Resumen */}
          <div className="bg-white rounded-lg p-4 border border-green-100 space-y-2">
            <Label className="text-xs font-semibold text-green-600 uppercase">Resumen del cargo</Label>
            <Textarea
              value={form.resumen || ""}
              onChange={(e) => setForm({ ...form, resumen: e.target.value })}
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Responsabilidades */}
          <div className="bg-white rounded-lg p-4 border border-green-100 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-green-600 uppercase">Responsabilidades</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleFormAddArrayItem("responsabilidades")} className="h-6 text-xs text-green-600">
                <Plus className="h-3 w-3 mr-1" /> Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {(form.responsabilidades || []).map((resp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-blue-500 text-sm flex-shrink-0">•</span>
                  <Input
                    value={resp}
                    onChange={(e) => handleFormArrayItem("responsabilidades", i, e.target.value)}
                    className="text-sm"
                  />
                  <button type="button" onClick={() => handleFormRemoveArrayItem("responsabilidades", i)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Requisitos */}
          <div className="bg-white rounded-lg p-4 border border-green-100 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-green-600 uppercase">Requisitos</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleFormAddArrayItem("requisitos")} className="h-6 text-xs text-green-600">
                <Plus className="h-3 w-3 mr-1" /> Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {(form.requisitos || []).map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-amber-500 text-sm flex-shrink-0">✓</span>
                  <Input
                    value={req}
                    onChange={(e) => handleFormArrayItem("requisitos", i, e.target.value)}
                    className="text-sm"
                  />
                  <button type="button" onClick={() => handleFormRemoveArrayItem("requisitos", i)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Ofrecemos */}
          <div className="bg-white rounded-lg p-4 border border-green-100 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-green-600 uppercase">Ofrecemos</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleFormAddArrayItem("ofrecemos")} className="h-6 text-xs text-green-600">
                <Plus className="h-3 w-3 mr-1" /> Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {(form.ofrecemos || []).map((oferta, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-green-500 text-sm flex-shrink-0">★</span>
                  <Input
                    value={oferta}
                    onChange={(e) => handleFormArrayItem("ofrecemos", i, e.target.value)}
                    className="text-sm"
                  />
                  <button type="button" onClick={() => handleFormRemoveArrayItem("ofrecemos", i)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Datos técnicos editables */}
          <div className="bg-white rounded-lg p-4 border border-green-100 space-y-3">
            <Label className="text-xs font-semibold text-green-600 uppercase">Datos técnicos</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Exp. mínima</Label>
                <Input type="number" min="0" value={form.experiencia_minima ?? 0} onChange={(e) => setForm({ ...form, experiencia_minima: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Exp. máxima</Label>
                <Input type="number" min="0" value={form.experiencia_maxima ?? 10} onChange={(e) => setForm({ ...form, experiencia_maxima: parseInt(e.target.value) || 10 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Jornada</Label>
                <select value={form.jornada || "Completa"} onChange={(e) => setForm({ ...form, jornada: e.target.value })} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                  <option value="Completa">Completa</option>
                  <option value="Media Jornada">Media Jornada</option>
                  <option value="Por Proyecto">Por Proyecto</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Disponibilidad</Label>
                <select value={form.disponibilidad || "Inmediata"} onChange={(e) => setForm({ ...form, disponibilidad: e.target.value })} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                  <option value="Inmediata">Inmediata</option>
                  <option value="15 días">15 días</option>
                  <option value="30 días">30 días</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Salario mínimo</Label>
                <Input type="number" value={form.salario_minimo || ""} onChange={(e) => setForm({ ...form, salario_minimo: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Salario máximo</Label>
                <Input type="number" value={form.salario_maximo || ""} onChange={(e) => setForm({ ...form, salario_maximo: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-500">Certificaciones</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleFormAddArrayItem("certificaciones_requeridas")} className="h-6 text-xs text-green-600">
                  <Plus className="h-3 w-3 mr-1" /> Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.certificaciones_requeridas || []).map((cert, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-2 rounded-full flex items-center gap-1">
                    <Input
                      value={cert}
                      onChange={(e) => {
                        const arr = [...(form.certificaciones_requeridas || [])];
                        arr[i] = e.target.value;
                        setForm({ ...form, certificaciones_requeridas: arr });
                      }}
                      className="bg-transparent border-0 shadow-none p-0 h-auto text-xs w-24"
                    />
                    <button type="button" onClick={() => {
                      setForm({ ...form, certificaciones_requeridas: (form.certificaciones_requeridas || []).filter((_, idx) => idx !== i) });
                    }} className="hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Estado */}
      <div className="space-y-2">
        <Label htmlFor="estado">Estado</Label>
        <select
          id="estado"
          value={form.estado || "Activa"}
          onChange={(e) => setForm({ ...form, estado: e.target.value })}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <option value="Activa">Activa</option>
          <option value="En revisión">En revisión</option>
          <option value="Cerrada">Cerrada</option>
        </select>
      </div>

      {/* Sección de Preguntas */}
      <Card className="p-5 space-y-4 border-teal-200 bg-teal-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-teal-700" />
            <h4 className="font-semibold text-teal-900 text-lg">Preguntas para candidatos</h4>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGeneratePreguntas}
            disabled={generatingPreguntas}
            className="gap-2 border-teal-300 text-teal-700 hover:bg-teal-50"
          >
            {generatingPreguntas ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generando...</>
            ) : (
              <><Sparkles className="h-4 w-4" />Generar con IA</>
            )}
          </Button>
        </div>
        <p className="text-sm text-teal-700">
          Agregá preguntas que los candidatos deberán responder al aplicar. Generá 2 informativas, 2 calificatorias y 2 excluyentes con IA.
        </p>

        {preguntasError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {preguntasError}
          </div>
        )}

        {/* Informativas */}
        <div className="bg-white rounded-lg p-4 border border-blue-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <div>
                <Label className="text-xs font-semibold text-blue-600 uppercase">Informativas</Label>
                <p className="text-xs text-slate-500">Para conocer mejor al candidato</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => handleAddPregunta("informativa")} className="h-6 text-xs text-blue-600">
              <Plus className="h-3 w-3 mr-1" /> Agregar
            </Button>
          </div>
          <div className="space-y-2">
            {getPreguntasByTipo("informativa").map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-blue-500 text-sm flex-shrink-0">•</span>
                <Input
                  value={p.pregunta}
                  onChange={(e) => handleUpdatePregunta(p.id, "pregunta", e.target.value)}
                  placeholder="Ej: ¿Cuál es tu disponibilidad para iniciar?"
                  className="text-sm"
                />
                <button type="button" onClick={() => handleDeletePregunta(p)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {getPreguntasByTipo("informativa").length === 0 && (
              <p className="text-xs text-slate-400 italic">No hay preguntas informativas</p>
            )}
          </div>
        </div>

        {/* Calificatorias */}
        <div className="bg-white rounded-lg p-4 border border-amber-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <div>
                <Label className="text-xs font-semibold text-amber-600 uppercase">Calificatorias</Label>
                <p className="text-xs text-slate-500">Evalúan competencias clave</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => handleAddPregunta("calificatoria")} className="h-6 text-xs text-amber-600">
              <Plus className="h-3 w-3 mr-1" /> Agregar
            </Button>
          </div>
          <div className="space-y-2">
            {getPreguntasByTipo("calificatoria").map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-amber-500 text-sm flex-shrink-0">✓</span>
                <Input
                  value={p.pregunta}
                  onChange={(e) => handleUpdatePregunta(p.id, "pregunta", e.target.value)}
                  placeholder="Ej: ¿Cuántos años de experiencia tienes con esta tecnología?"
                  className="text-sm"
                />
                <button type="button" onClick={() => handleDeletePregunta(p)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {getPreguntasByTipo("calificatoria").length === 0 && (
              <p className="text-xs text-slate-400 italic">No hay preguntas calificatorias</p>
            )}
          </div>
        </div>

        {/* Excluyentes */}
        <div className="bg-white rounded-lg p-4 border border-red-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚫</span>
              <div>
                <Label className="text-xs font-semibold text-red-600 uppercase">Excluyentes</Label>
                <p className="text-xs text-slate-500">Respuesta Sí/No - pueden descartar candidatos</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => handleAddPregunta("excluyente")} className="h-6 text-xs text-red-600">
              <Plus className="h-3 w-3 mr-1" /> Agregar
            </Button>
          </div>
          <div className="space-y-2">
            {getPreguntasByTipo("excluyente").map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-red-500 text-sm flex-shrink-0">!</span>
                <Input
                  value={p.pregunta}
                  onChange={(e) => handleUpdatePregunta(p.id, "pregunta", e.target.value)}
                  placeholder="Ej: ¿Tienes disponibilidad para viajar?"
                  className="text-sm"
                />
                <Badge variant="outline" className="text-xs text-red-600 border-red-200 flex-shrink-0">Sí / No</Badge>
                <button type="button" onClick={() => handleDeletePregunta(p)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {getPreguntasByTipo("excluyente").length === 0 && (
              <p className="text-xs text-slate-400 italic">No hay preguntas excluyentes</p>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          onClick={onSave}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? "Guardando..." : "Guardar Vacante"}
        </Button>
      </div>
    </Card>
  );
}

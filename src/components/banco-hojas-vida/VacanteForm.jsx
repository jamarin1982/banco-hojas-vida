import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

export function VacanteForm({ form, setForm, onSave, onCancel, isLoading }) {
  const handleCertificacionChange = (e) => {
    const value = e.target.value;
    if (value && e.key === "Enter") {
      e.preventDefault();
      setForm({
        ...form,
        certificaciones_requeridas: [...(form.certificaciones_requeridas || []), value.trim()],
      });
      e.target.value = "";
    }
  };

  const removeCertificacion = (index) => {
    setForm({
      ...form,
      certificaciones_requeridas: form.certificaciones_requeridas.filter((_, i) => i !== index),
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-bold text-slate-900">
        {form.id ? "Editar Vacante" : "Nueva Vacante"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título de la Posición *</Label>
          <Input
            id="titulo"
            placeholder="Ej: Senior Full Stack Developer"
            value={form.titulo || ""}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cargo">Cargo *</Label>
          <Input
            id="cargo"
            placeholder="Ej: DESARROLLADOR"
            value={form.cargo || ""}
            onChange={(e) => setForm({ ...form, cargo: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad *</Label>
          <Input
            id="ciudad"
            placeholder="Ej: Barranquilla"
            value={form.ciudad || ""}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="disponibilidad">Disponibilidad</Label>
          <select
            id="disponibilidad"
            value={form.disponibilidad || "Inmediata"}
            onChange={(e) => setForm({ ...form, disponibilidad: e.target.value })}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <option value="Inmediata">Inmediata</option>
            <option value="15 días">15 días</option>
            <option value="30 días">30 días</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jornada">Jornada</Label>
          <select
            id="jornada"
            value={form.jornada || "Completa"}
            onChange={(e) => setForm({ ...form, jornada: e.target.value })}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <option value="Completa">Completa</option>
            <option value="Media Jornada">Media Jornada</option>
            <option value="Por Proyecto">Por Proyecto</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <select
            id="estado"
            value={form.estado || "Activa"}
            onChange={(e) => setForm({ ...form, estado: e.target.value })}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <option value="Activa">Activa</option>
            <option value="En revisión">En revisión</option>
            <option value="Cerrada">Cerrada</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          placeholder="Detalla los requisitos, responsabilidades y beneficios..."
          value={form.descripcion || ""}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="exp-min">Experiencia Mínima (años)</Label>
          <Input
            id="exp-min"
            type="number"
            min="0"
            max="50"
            value={form.experiencia_minima || 0}
            onChange={(e) => setForm({ ...form, experiencia_minima: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exp-max">Experiencia Máxima (años)</Label>
          <Input
            id="exp-max"
            type="number"
            min="0"
            max="50"
            value={form.experiencia_maxima || 10}
            onChange={(e) => setForm({ ...form, experiencia_maxima: parseInt(e.target.value) || 10 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salario-min">Salario Base (Min)</Label>
          <Input
            id="salario-min"
            type="number"
            placeholder="Ej: 3000000"
            value={form.salario_minimo || ""}
            onChange={(e) => setForm({ ...form, salario_minimo: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Certificaciones Requeridas (Presiona Enter para agregar)</Label>
        <Input
          type="text"
          placeholder="Ej: JavaScript, React, Node.js"
          onKeyDown={handleCertificacionChange}
        />
        <div className="flex flex-wrap gap-2">
          {(form.certificaciones_requeridas || []).map((cert, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-2 rounded-full">
              {cert}
              <button
                onClick={() => removeCertificacion(index)}
                className="ml-2 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

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

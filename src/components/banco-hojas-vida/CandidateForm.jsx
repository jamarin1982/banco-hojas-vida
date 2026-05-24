import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, AlertCircle } from "lucide-react";

export function CandidateForm({ form, setForm, handleAdd, editingCandidate }) {
  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {editingCandidate ? "Editar candidato" : "Nuevo candidato"}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Ingresa la información del candidato para añadirlo a la base de talento
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="space-y-6">
        {/* Sección 1: Información personal */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Información personal</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="font-medium">Nombre completo</Label>
              <Input 
                value={form.nombre} 
                onChange={(event) => setField("nombre", event.target.value)}
                placeholder="Juan Pérez"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Ciudad</Label>
              <Input 
                value={form.ciudad} 
                onChange={(event) => setField("ciudad", event.target.value)}
                placeholder="Bogotá"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Cargo objetivo</Label>
              <Input 
                value={form.cargo} 
                onChange={(event) => setField("cargo", event.target.value)}
                placeholder="Desarrollador Senior"
                className="rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Sección 2: Experiencia y competencias */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Experiencia y competencias</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="font-medium">Años de experiencia</Label>
              <Input 
                type="number" 
                value={form.experiencia} 
                onChange={(event) => setField("experiencia", event.target.value)}
                placeholder="5"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="font-medium">Certificaciones</Label>
              <Input
                value={form.certificaciones}
                onChange={(event) => setField("certificaciones", event.target.value)}
                placeholder="AWS, Scrum Master, etc (separadas por coma)"
                className="rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Sección 3: Disponibilidad y jornada */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Disponibilidad</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="font-medium">Disponibilidad</Label>
              <Input
                value={form.disponibilidad}
                onChange={(event) => setField("disponibilidad", event.target.value)}
                placeholder="Inmediata"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Jornada</Label>
              <Input 
                value={form.jornada} 
                onChange={(event) => setField("jornada", event.target.value)} 
                placeholder="Tiempo completo" 
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Aspiración salarial</Label>
              <div className="flex items-center">
                <span className="text-slate-500 mr-2">$</span>
                <Input 
                  type="number" 
                  value={form.aspiracion} 
                  onChange={(event) => setField("aspiracion", event.target.value)}
                  placeholder="3000000"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección 4: Documento */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Documentación</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium">Currículum (PDF)</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                <Input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={(event) => setField("cv", event.target.files[0])}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección 5: Observaciones */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Observaciones adicionales</h3>
          <div className="space-y-2">
            <Textarea 
              value={form.observaciones} 
              onChange={(event) => setField("observaciones", event.target.value)} 
              placeholder="Notas adicionales sobre el candidato..."
              rows={4}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end">
        <Button 
          variant="outline"
          className="rounded-lg"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleAdd}
          className="gap-2 rounded-lg bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          {editingCandidate ? "Actualizar candidato" : "Guardar candidato"}
        </Button>
      </div>

      {/* Aviso de protección de datos */}
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200 flex gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Protección de datos personales</p>
          <p className="text-sm text-blue-700 mt-1">
            Al guardar este candidato, declaras que has obtenido su consentimiento para el tratamiento de sus datos personales
            conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.
          </p>
        </div>
      </div>
    </div>
  );
}

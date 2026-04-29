import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  X,
  Filter,
  ChevronRight,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { usePortalVacantes } from "@/hooks/usePortalVacantes";
import { useState } from "react";

// ─── Modal de Aplicación ────────────────────────────────────────────────────

function ApplyModal({ vacante, form, setForm, applying, success, error, onApply, onClose }) {
  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  if (!vacante) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <Briefcase className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg leading-tight">{vacante.titulo}</h2>
              <p className="text-sm text-slate-500">{vacante.cargo} · {vacante.ciudad}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {success ? (
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4 py-8 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">¡Aplicación enviada!</h3>
                <p className="mt-2 text-slate-600">
                  Tu hoja de vida fue registrada para la vacante{" "}
                  <span className="font-semibold text-purple-700">{vacante.titulo}</span>.
                  El equipo de reclutamiento revisará tu perfil pronto.
                </p>
              </div>
              <Button onClick={onClose} className="mt-2 bg-purple-600 hover:bg-purple-700">
                Cerrar
              </Button>
            </Motion.div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Datos personales */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                  Datos personales
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      Nombre completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.nombre}
                      onChange={(e) => setField("nombre", e.target.value)}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      Ciudad <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.ciudad}
                      onChange={(e) => setField("ciudad", e.target.value)}
                      placeholder="Bogotá"
                    />
                  </div>
                </div>
              </div>

              {/* Experiencia */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                  Experiencia y perfil
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      Cargo al que aplica <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.cargo}
                      onChange={(e) => setField("cargo", e.target.value)}
                      placeholder={vacante.cargo}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Años de experiencia</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.experiencia}
                      onChange={(e) => setField("experiencia", e.target.value)}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-sm font-medium">Certificaciones</Label>
                    <Input
                      value={form.certificaciones}
                      onChange={(e) => setField("certificaciones", e.target.value)}
                      placeholder="Ej: Aseo hospitalario, BPM, HACCP (separadas por coma)"
                    />
                  </div>
                </div>
              </div>

              {/* Disponibilidad */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                  Disponibilidad
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Disponibilidad</Label>
                    <Input
                      value={form.disponibilidad}
                      onChange={(e) => setField("disponibilidad", e.target.value)}
                      placeholder="Inmediata"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Jornada preferida</Label>
                    <Input
                      value={form.jornada}
                      onChange={(e) => setField("jornada", e.target.value)}
                      placeholder="Completa"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Aspiración salarial ($)</Label>
                    <Input
                      type="number"
                      value={form.aspiracion}
                      onChange={(e) => setField("aspiracion", e.target.value)}
                      placeholder="2500000"
                    />
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Mensaje adicional</Label>
                <Textarea
                  value={form.observaciones}
                  onChange={(e) => setField("observaciones", e.target.value)}
                  placeholder="Cuéntanos algo más sobre ti o por qué te interesa esta vacante..."
                  rows={3}
                />
              </div>

              {/* Acciones */}
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={onClose} disabled={applying}>
                  Cancelar
                </Button>
                <Button
                  onClick={onApply}
                  disabled={applying}
                  className="gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  {applying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-4 w-4" />
                      Enviar aplicación
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Motion.div>
    </div>
  );
}

// ─── Tarjeta de Vacante ──────────────────────────────────────────────────────

function VacanteCard({ vacante, onApply, index }) {
  const [expanded, setExpanded] = useState(false);

  const salario =
    vacante.salario_minimo && vacante.salario_maximo
      ? `$${Number(vacante.salario_minimo).toLocaleString("es-CO")} – $${Number(
          vacante.salario_maximo
        ).toLocaleString("es-CO")}`
      : vacante.salario_minimo
      ? `Desde $${Number(vacante.salario_minimo).toLocaleString("es-CO")}`
      : null;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-purple-200 transition-all"
    >
      <div className="p-5 space-y-4">
        {/* Encabezado */}
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
          <Badge className="shrink-0 bg-green-50 text-green-700 border-green-200 border">
            {vacante.estado}
          </Badge>
        </div>

        {/* Info rápida */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {vacante.ciudad}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {vacante.experiencia_minima}–{vacante.experiencia_maxima} años exp.
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {vacante.jornada}
          </span>
          {salario && (
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <DollarSign className="h-3.5 w-3.5" />
              {salario}
            </span>
          )}
        </div>

        {/* Certificaciones */}
        {vacante.certificaciones_requeridas?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {vacante.certificaciones_requeridas.slice(0, 4).map((cert, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-xs bg-slate-100 text-slate-700 border-0"
              >
                {cert}
              </Badge>
            ))}
            {vacante.certificaciones_requeridas.length > 4 && (
              <Badge variant="outline" className="text-xs text-slate-500">
                +{vacante.certificaciones_requeridas.length - 4} más
              </Badge>
            )}
          </div>
        )}

        {/* Descripción expandible */}
        {vacante.descripcion && (
          <div>
            <p
              className={`text-sm text-slate-600 leading-relaxed ${
                expanded ? "" : "line-clamp-2"
              }`}
            >
              {vacante.descripcion}
            </p>
            {vacante.descripcion.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                {expanded ? "Ver menos" : "Ver más"}
              </button>
            )}
          </div>
        )}

        {/* Disponibilidad + CTA */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Disponibilidad:{" "}
            <span className="font-medium text-slate-700">{vacante.disponibilidad}</span>
          </span>
          <Button
            onClick={() => onApply(vacante)}
            size="sm"
            className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Aplicar ahora
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Motion.div>
  );
}

// ─── Panel de Filtros ────────────────────────────────────────────────────────

function FilterPanel({
  searchQuery, setSearchQuery,
  filterCiudad, setFilterCiudad,
  filterCargo, setFilterCargo,
  filterJornada, setFilterJornada,
  filterDisponibilidad, setFilterDisponibilidad,
  filterExperiencia, setFilterExperiencia,
  ciudades, cargos, jornadas, disponibilidades,
  hasActiveFilters, clearFilters,
  totalVacantes, filteredCount,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-sm">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por cargo, ciudad, certificación..."
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filtros en grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Ciudad */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Ciudad
          </Label>
          <select
            value={filterCiudad}
            onChange={(e) => setFilterCiudad(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas las ciudades</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Cargo */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Cargo
          </Label>
          <select
            value={filterCargo}
            onChange={(e) => setFilterCargo(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos los cargos</option>
            {cargos.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Jornada */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Jornada
          </Label>
          <select
            value={filterJornada}
            onChange={(e) => setFilterJornada(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Cualquier jornada</option>
            {jornadas.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>

        {/* Disponibilidad */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Disponibilidad
          </Label>
          <select
            value={filterDisponibilidad}
            onChange={(e) => setFilterDisponibilidad(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Cualquier disponibilidad</option>
            {disponibilidades.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Experiencia */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Mis años de exp.
          </Label>
          <select
            value={filterExperiencia}
            onChange={(e) => setFilterExperiencia(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Cualquier nivel</option>
            <option value="0">Sin experiencia (0 años)</option>
            <option value="1">1 año</option>
            <option value="2">2 años</option>
            <option value="3">3 años</option>
            <option value="5">5 años</option>
            <option value="8">8 años</option>
            <option value="10">10+ años</option>
          </select>
        </div>
      </div>

      {/* Resumen y limpiar */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          Mostrando{" "}
          <span className="font-semibold text-slate-800">{filteredCount}</span> de{" "}
          <span className="font-semibold text-slate-800">{totalVacantes}</span> vacantes
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────

export function PortalVacantes() {
  const {
    filtered,
    vacantes,
    loading,
    error,
    searchQuery, setSearchQuery,
    filterCiudad, setFilterCiudad,
    filterCargo, setFilterCargo,
    filterJornada, setFilterJornada,
    filterDisponibilidad, setFilterDisponibilidad,
    filterExperiencia, setFilterExperiencia,
    ciudades, cargos, jornadas, disponibilidades,
    hasActiveFilters, clearFilters,
    selectedVacante,
    applyForm, setApplyForm,
    applying, applySuccess, applyError,
    openApplyModal, closeApplyModal, handleApply,
  } = usePortalVacantes();

  return (
    <div className="space-y-6">
      {/* Encabezado del portal */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Portal de Vacantes</h2>
            <p className="text-purple-200 text-sm">Encuentra tu próxima oportunidad laboral</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-purple-100">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-purple-300" />
            {vacantes.length} vacantes activas
          </span>
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4 text-purple-300" />
            Filtros avanzados de búsqueda
          </span>
          <span className="flex items-center gap-1.5">
            <ChevronRight className="h-4 w-4 text-purple-300" />
            Aplicación directa en línea
          </span>
        </div>
      </div>

      {/* Panel de filtros */}
      <FilterPanel
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        filterCiudad={filterCiudad} setFilterCiudad={setFilterCiudad}
        filterCargo={filterCargo} setFilterCargo={setFilterCargo}
        filterJornada={filterJornada} setFilterJornada={setFilterJornada}
        filterDisponibilidad={filterDisponibilidad} setFilterDisponibilidad={setFilterDisponibilidad}
        filterExperiencia={filterExperiencia} setFilterExperiencia={setFilterExperiencia}
        ciudades={ciudades} cargos={cargos} jornadas={jornadas} disponibilidades={disponibilidades}
        hasActiveFilters={hasActiveFilters} clearFilters={clearFilters}
        totalVacantes={vacantes.length} filteredCount={filtered.length}
      />

      {/* Estado de carga / error */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <span>Cargando vacantes...</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-5">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">No se pudieron cargar las vacantes</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de vacantes */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Filter className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">No hay vacantes con esos filtros</p>
                  <p className="text-sm mt-1">Intenta ajustar los criterios de búsqueda</p>
                </div>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="mt-2 gap-2">
                    <X className="h-4 w-4" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((vacante, index) => (
                <VacanteCard
                  key={vacante.id}
                  vacante={vacante}
                  index={index}
                  onApply={openApplyModal}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de aplicación */}
      <AnimatePresence>
        {selectedVacante && (
          <ApplyModal
            vacante={selectedVacante}
            form={applyForm}
            setForm={setApplyForm}
            applying={applying}
            success={applySuccess}
            error={applyError}
            onApply={handleApply}
            onClose={closeApplyModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

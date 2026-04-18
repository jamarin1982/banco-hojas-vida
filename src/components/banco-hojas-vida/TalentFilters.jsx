import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, Lightbulb } from "lucide-react";

export function TalentFilters({
  query,
  setQuery,
  filterCity,
  setFilterCity,
  filterCargo,
  setFilterCargo,
  candidates,
}) {
  return (
    <div className="space-y-4">
      {/* Header de filtros */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-slate-900">Filtros</h3>
      </div>

      {/* Búsqueda */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-slate-600">Buscar candidato</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-lg pl-9 border-slate-200"
            placeholder="Nombre, cargo..."
          />
        </div>
      </div>

      {/* Filtro por Ciudad */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-slate-600">Ciudad</Label>
        <Select value={filterCity} onValueChange={setFilterCity}>
          <SelectTrigger className="rounded-lg border-slate-200">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ciudades</SelectItem>
            {[...new Set(candidates.map((candidate) => candidate.ciudad))].map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro por Cargo */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-slate-600">Cargo</Label>
        <Select value={filterCargo} onValueChange={setFilterCargo}>
          <SelectTrigger className="rounded-lg border-slate-200">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cargos</SelectItem>
            {[...new Set(candidates.map((candidate) => candidate.cargo))].map((cargo) => (
              <SelectItem key={cargo} value={cargo}>
                {cargo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Información adicional */}
      <div className="rounded-lg bg-blue-50 p-3 border border-blue-200 mt-6 space-y-2">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-blue-900">Próximas funcionalidades</p>
            <p className="text-xs text-blue-700 mt-1">Integración con WhatsApp, correo, OCR y bases SQL reales.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

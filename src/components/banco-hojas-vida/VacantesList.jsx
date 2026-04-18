import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, MapPin, Clock, Trash2, Edit2, Plus } from "lucide-react";
import { motion as Motion } from "framer-motion";

export function VacantesList({ vacantes, selectedVacante, onSelect, onDelete, onNew, isLoading }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Vacantes Activas</h3>
        <Button
          onClick={onNew}
          className="bg-purple-600 hover:bg-purple-700 gap-2"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          Nueva Vacante
        </Button>
      </div>

      {vacantes.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No hay vacantes disponibles</p>
        </Card>
      ) : (
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {vacantes.map((vacante, index) => (
            <Motion.div
              key={vacante.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(vacante)}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedVacante?.id === vacante.id
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{vacante.titulo}</h4>
                    <p className="text-sm text-slate-600 mt-1">{vacante.cargo}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {vacante.estado}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {vacante.ciudad}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {vacante.experiencia_minima}-{vacante.experiencia_maxima} años
                  </div>
                  <div>Jornada: {vacante.jornada}</div>
                </div>

                {vacante.certificaciones_requeridas?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {vacante.certificaciones_requeridas.slice(0, 3).map((cert, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs py-0.5">
                        {cert}
                      </Badge>
                    ))}
                    {vacante.certificaciones_requeridas.length > 3 && (
                      <Badge variant="outline" className="text-xs py-0.5">
                        +{vacante.certificaciones_requeridas.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(vacante.id);
                    }}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

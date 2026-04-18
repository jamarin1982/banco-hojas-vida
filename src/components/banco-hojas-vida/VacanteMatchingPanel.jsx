import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, MapPin, CheckCircle, Zap, TrendingUp } from "lucide-react";
import { motion as Motion } from "framer-motion";

export function VacanteMatchingPanel({ vacante, topCandidates = [] }) {
  if (!vacante) {
    return (
      <div className="rounded-2xl border border-slate-300 border-dashed p-12 text-center text-slate-500">
        <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p>Selecciona una vacante para ver candidatos sugeridos</p>
      </div>
    );
  }

  // Filtrar candidatos por score (top matches)
  const topMatches = topCandidates.slice(0, 8);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Tarjeta de vacante */}
      <Motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-white shadow-sm p-6 space-y-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Briefcase className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{vacante.titulo}</h3>
            <p className="text-sm text-slate-600">{vacante.cargo}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>{vacante.ciudad}</span>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Experiencia</p>
              <p className="font-medium text-slate-900">
                {vacante.experiencia_minima} - {vacante.experiencia_maxima} años
              </p>
            </div>

            {vacante.certificaciones_requeridas?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Certificaciones</p>
                <div className="flex flex-wrap gap-2">
                  {vacante.certificaciones_requeridas.map((cert) => (
                    <Badge
                      key={cert}
                      variant="outline"
                      className="rounded-full bg-purple-50 border-purple-200 text-purple-700"
                    >
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Disponibilidad</p>
                <p className="text-sm text-slate-900">{vacante.disponibilidad}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Jornada</p>
                <p className="text-sm text-slate-900">{vacante.jornada}</p>
              </div>
            </div>

            {vacante.descripcion && (
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Descripción</p>
                <p className="text-sm text-slate-700 line-clamp-3">{vacante.descripcion}</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <p className="text-xs text-emerald-700 font-medium">
            Matching automático activado · {topMatches.length} candidatos encontrados
          </p>
        </div>
      </Motion.div>

      {/* Candidatos sugeridos */}
      <Motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Candidatos sugeridos</h3>
          <Badge className="ml-auto bg-emerald-100 text-emerald-700">
            {topMatches.length}
          </Badge>
        </div>

        {topMatches.length === 0 ? (
          <div className="rounded-2xl border border-slate-300 border-dashed p-8 text-center text-slate-500">
            <p>No hay candidatos disponibles para esta vacante</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topMatches.map((candidate, index) => (
              <Motion.div
                key={candidate.candidato_id || candidate.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-all hover:border-purple-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{candidate.nombre}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {candidate.cargo} · {candidate.ciudad}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        className={`rounded-full px-3 py-1 text-sm font-bold flex items-center gap-1 ${
                          candidate.score_total >= 85
                            ? "bg-emerald-100 text-emerald-700"
                            : candidate.score_total >= 70
                            ? "bg-blue-100 text-blue-700"
                            : candidate.score_total >= 50
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <TrendingUp className="h-3 w-3" />
                        {Math.round(candidate.score_total)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress value={candidate.score_total} className="h-2" />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Exp:</span>
                        <span className="font-medium">{Math.round(candidate.score_experiencia)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Cert:</span>
                        <span className="font-medium">{Math.round(candidate.score_certificaciones)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Ubicación:</span>
                        <span className="font-medium">{Math.round(candidate.score_ubicacion)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Disp:</span>
                        <span className="font-medium">{Math.round(candidate.score_disponibilidad)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 border-t border-slate-100 pt-2">
                    <span className="font-medium">{candidate.experiencia} años exp.</span>
                    {candidate.disponibilidad && <span>• {candidate.disponibilidad}</span>}
                    {candidate.jornada && <span>• {candidate.jornada}</span>}
                  </div>
                </div>
              </Motion.div>
            ))}
          </div>
        )}
      </Motion.div>
    </div>
  );
}

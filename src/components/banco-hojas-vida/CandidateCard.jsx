import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Briefcase, MapPin, Star, Download, Zap, Edit3, Trash2, ShieldCheck } from "lucide-react";
import { motion as Motion } from "framer-motion";

export function CandidateCard({
  candidate,
  statusColor,
  moveStatus,
  setEditingCandidate,
  setActiveTab,
  handleDelete,
  getCvUrl,
  loadingIA,
  onAnalyzeCv,
}) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className="rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all">
        <CardContent className="p-6 space-y-6">
          {/* Header con nombre y estado */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900">{candidate.nombre}</h3>
                <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(candidate.estado)}`}>
                  {candidate.estado}
                </Badge>
              </div>
              
              {/* Información de contacto y detalles */}
              <div className="grid gap-2 sm:grid-cols-2 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400" /> {candidate.cargo}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" /> {candidate.ciudad}
                </span>
                <span className="font-medium text-slate-700">{candidate.experiencia} años exp.</span>
                <span className="font-medium text-slate-700">{candidate.jornada}</span>
              </div>

              {/* Disponibilidad y aspiración */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline" className="rounded-full text-xs">{candidate.disponibilidad}</Badge>
                <Badge variant="outline" className="rounded-full text-xs bg-slate-50">
                  💰 ${candidate.aspiracion.toLocaleString("es-CO")}
                </Badge>
              </div>
            </div>

            {/* Score de match real (lado derecho) */}
            <div className="w-40 space-y-3 rounded-xl bg-slate-50 p-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-slate-600">
                    {candidate.score > 0 ? "Mejor Match" : "Sin match"}
                  </span>
                </div>
                <p className={`text-3xl font-bold ${candidate.score >= 75 ? "text-green-600" : candidate.score >= 50 ? "text-amber-600" : "text-slate-400"}`}>
                  {candidate.score > 0 ? `${candidate.score}%` : "N/A"}
                </p>
              </div>
              {candidate.score > 0 && <Progress value={candidate.score} className="h-2" />}
              {candidate.mejorMatchVacante && (
                <p className="text-xs text-slate-500 text-center truncate" title={candidate.mejorMatchVacante}>
                  {candidate.mejorMatchVacante}
                </p>
              )}
            </div>
          </div>

          {/* Certificaciones */}
          {candidate.certificaciones.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase">Certificaciones</p>
              <div className="flex flex-wrap gap-2">
                {candidate.certificaciones.map((certification) => (
                  <Badge key={certification} variant="outline" className="rounded-full text-xs bg-blue-50 text-blue-700 border-blue-200">
                    {certification}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones */}
          {candidate.observaciones && (
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <p className="text-sm text-slate-700">{candidate.observaciones}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="space-y-3 pt-2">
            {/* Botones principales */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => moveStatus(candidate.id, "Entrevista")}
                variant="outline"
                className="gap-2 rounded-xl"
              >
                Entrevista
              </Button>
              <Button 
                onClick={() => moveStatus(candidate.id, "Aprobado")}
                className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700"
              >
                <ShieldCheck className="h-4 w-4" /> Aprobar
              </Button>
            </div>

            {/* Botones secundarios - CV y herramientas */}
            <div className="grid gap-3">
              {candidate.cv_path && (
                <a href={getCvUrl(candidate.cv_path)} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button variant="outline" className="w-full gap-2 rounded-xl">
                    <Download className="h-4 w-4" /> Ver CV
                  </Button>
                </a>
              )}

              {candidate.cv_path && (
                <Button 
                  disabled={loadingIA} 
                  onClick={() => onAnalyzeCv(candidate)}
                  className="w-full gap-2 rounded-xl bg-purple-600 hover:bg-purple-700"
                >
                  <Zap className="h-4 w-4" />
                  {loadingIA ? "Analizando..." : "Analizar con IA"}
                </Button>
              )}
            </div>

            {/* Botones de gestión */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <Button
                onClick={() => {
                  setEditingCandidate(candidate);
                  setActiveTab("registro");
                }}
                variant="outline"
                className="gap-2 rounded-xl"
              >
                <Edit3 className="h-4 w-4" /> Editar
              </Button>
              <Button 
                onClick={() => handleDelete(candidate.id)}
                variant="destructive"
                className="gap-2 rounded-xl"
              >
                <Trash2 className="h-4 w-4" /> Eliminar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Motion.div>
  );
}

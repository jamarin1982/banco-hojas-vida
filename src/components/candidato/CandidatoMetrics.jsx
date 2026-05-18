import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion as Motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";

function StatBar({ label, value, color, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm font-medium text-slate-700 w-32 truncate">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
        <Motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${color} flex items-center justify-end pr-2`}
        >
          <span className="text-xs font-bold text-white">{value}</span>
        </Motion.div>
      </div>
      <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
    </div>
  );
}

export function CandidatoMetrics({ stats }) {
  if (!stats) return null;

  const embudo = stats.embudoAplicaciones || {};
  const embudoMax = Math.max(...Object.values(embudo), 1);

  const embudoLabels = {
    Sugerido: { label: "Sugerido", color: "bg-blue-500" },
    Aplico: { label: "Aplicó", color: "bg-slate-500" },
    "Aplicó": { label: "Aplicó", color: "bg-slate-500" },
    Preseleccionado: { label: "Preseleccionado", color: "bg-blue-500" },
    Entrevista: { label: "Entrevista", color: "bg-amber-500" },
    Aprobado: { label: "Aprobado", color: "bg-green-500" },
    Contratado: { label: "Contratado", color: "bg-emerald-600" },
  };

  const kpiCards = [
    { label: "Aplicaciones totales", value: stats.aplicacionesTotales, icon: FileText, color: "from-blue-500 to-blue-600", bg: "bg-blue-50", iconC: "text-blue-600" },
    { label: "En vacantes activas", value: stats.aplicacionesActivas, icon: Briefcase, color: "from-green-500 to-green-600", bg: "bg-green-50", iconC: "text-green-600" },
    { label: "Mejor match", value: `${stats.mejorMatch}%`, icon: Star, color: "from-amber-500 to-amber-600", bg: "bg-amber-50", iconC: "text-amber-600" },
    { label: "Perfil completo", value: `${stats.perfilCompleto}%`, icon: CheckCircle, color: "from-teal-500 to-teal-600", bg: "bg-teal-50", iconC: "text-teal-600" },
    { label: "Match promedio", value: `${stats.matchPromedio}%`, icon: Target, color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", iconC: "text-indigo-600" },
    { label: "Vacantes recomendadas", value: stats.vacantesRecomendadas, icon: MapPin, color: "from-purple-500 to-purple-600", bg: "bg-purple-50", iconC: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((item, i) => (
          <Motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ translateY: -4 }}>
            <Card className="rounded-2xl shadow-sm border-0 overflow-hidden transition-all hover:shadow-md">
              <div className={`h-1 bg-gradient-to-r ${item.color}`} />
              <CardContent className={`${item.bg} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-600">{item.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white">
                    <item.icon className={`h-5 w-5 ${item.iconC}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Motion.div>
        ))}
      </div>

      {/* Embudo + Actividad */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Estado de tus aplicaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(embudo).length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Aún no has aplicado a vacantes</p>
            ) : (
              Object.entries(embudo).map(([estado, valor]) => {
                const cfg = embudoLabels[estado] || { label: estado, color: "bg-slate-400" };
                return <StatBar key={estado} label={cfg.label} value={valor} color={cfg.color} max={embudoMax} />;
              })
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">En vacantes activas</span>
              <span className="text-sm font-bold text-green-600">{stats.aplicacionesActivas}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">En vacantes cerradas</span>
              <span className="text-sm font-bold text-slate-500">{stats.aplicacionesCerradas}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Última actividad</span>
              <span className="text-sm font-bold text-slate-800">
                {stats.ultimaActividad
                  ? new Date(stats.ultimaActividad).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
                  : "Sin actividad"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-slate-600">Recomendaciones</span>
              <span className="text-sm font-bold text-purple-600">{stats.vacantesRecomendadas} vacantes</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

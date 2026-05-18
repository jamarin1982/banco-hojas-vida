import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion as Motion } from "framer-motion";
import {
  AlertCircle,
  BarChart3,
  Briefcase,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  ShieldCheck,
  Target,
  UserPlus,
  Users,
} from "lucide-react";

function FunnelBar({ label, value, color, max }) {
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

function ScoreBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-slate-600 w-40">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
        <Motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value || 0}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full ${color}`}
        />
      </div>
      <span className="text-sm font-semibold text-slate-800 w-12 text-right">{value || 0}%</span>
    </div>
  );
}

export function DashboardMetrics({ metrics }) {
  if (!metrics) return null;

  const embudo = metrics.embudoAplicaciones || {};
  const embudoMax = Math.max(...Object.values(embudo), 1);
  const desglose = metrics.desgloseScores || {};
  const topCiudades = metrics.topCiudades || [];
  const scorePorVacante = metrics.scorePorVacante || [];
  const topVacantes = metrics.topVacantes || [];

  const embudoLabels = {
    Sugerido: { label: "Sugeridos", color: "bg-blue-500" },
    Aplico: { label: "Aplicaron", color: "bg-teal-500" },
    Entrevista: { label: "Entrevista", color: "bg-purple-500" },
    Aprobado: { label: "Aprobados", color: "bg-green-500" },
    Contratado: { label: "Contratados", color: "bg-emerald-600" },
  };

  const kpiCards = [
    { label: "Candidatos", value: metrics.totalCandidatos, icon: Users, color: "from-teal-500 to-teal-600", bg: "bg-teal-50", iconC: "text-teal-600" },
    { label: "Vacantes activas", value: metrics.vacantesActivas, icon: Briefcase, color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", iconC: "text-indigo-600" },
    { label: "Match ≥ 75%", value: metrics.matchAlto, icon: Target, color: "from-green-500 to-green-600", bg: "bg-green-50", iconC: "text-green-600" },
    { label: "Sin postulantes", value: metrics.vacantesSinPostulantes, icon: AlertCircle, color: "from-amber-500 to-amber-600", bg: "bg-amber-50", iconC: "text-amber-600" },
    { label: "Score promedio", value: `${metrics.scorePromedio}%`, icon: BarChart3, color: "from-blue-500 to-blue-600", bg: "bg-blue-50", iconC: "text-blue-600" },
    { label: "Con CV", value: metrics.candConCv, icon: FileText, color: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50", iconC: "text-cyan-600" },
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

      {/* Embudo + Desglose de scores */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-teal-600" />
              Embudo de aplicaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(embudo).length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Sin datos aún</p>
            ) : (
              Object.entries(embudo).map(([estado, valor]) => {
                const cfg = embudoLabels[estado] || { label: estado, color: "bg-slate-400" };
                return <FunnelBar key={estado} label={cfg.label} value={valor} color={cfg.color} max={embudoMax} />;
              })
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-teal-600" />
              Desglose de match promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreBar label="Experiencia" value={desglose.avg_experiencia} color="bg-teal-500" />
            <ScoreBar label="Certificaciones" value={desglose.avg_certificaciones} color="bg-blue-500" />
            <ScoreBar label="Ubicación" value={desglose.avg_ubicacion} color="bg-purple-500" />
            <ScoreBar label="Disponibilidad" value={desglose.avg_disponibilidad} color="bg-amber-500" />
          </CardContent>
        </Card>
      </div>

      {/* Vacantes por estado + Top ciudades */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-teal-600" />
              Vacantes por estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(metrics.vacantesPorEstado || {}).length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Sin datos</p>
            ) : (
              Object.entries(metrics.vacantesPorEstado).map(([estado, total]) => (
                <div key={estado} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-700">{estado}</span>
                  <span className="text-sm font-bold text-slate-900">{total}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-teal-600" />
              Top ciudades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCiudades.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Sin datos</p>
            ) : (
              topCiudades.map((c, i) => (
                <div key={c.ciudad} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-700">{i + 1}. {c.ciudad}</span>
                  <span className="text-sm font-bold text-slate-900">{c.total} candidatos</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score por vacante + Top vacantes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              Score por vacante activa
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {scorePorVacante.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Sin datos</p>
            ) : (
              scorePorVacante.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{v.titulo}</p>
                    <p className="text-xs text-slate-500">{v.total_aplicaciones} aplicaciones · {v.match_alto} match alto</p>
                  </div>
                  <span className={`ml-3 text-sm font-bold ${v.score_promedio >= 75 ? "text-green-600" : v.score_promedio >= 50 ? "text-amber-600" : "text-slate-400"}`}>
                    {v.score_promedio || "N/A"}%
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-teal-600" />
              Vacantes más populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topVacantes.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Sin datos</p>
            ) : (
              topVacantes.map((v, i) => (
                <div key={v.id} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-700">{i + 1}. {v.titulo}</span>
                  <span className="text-sm font-bold text-slate-900">{v.aplicaciones} aplicaciones</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

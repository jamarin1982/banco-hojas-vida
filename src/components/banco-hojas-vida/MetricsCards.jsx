import { Card, CardContent } from "@/components/ui/card";
import { motion as Motion } from "framer-motion";
import { BarChart3, Briefcase, CheckCircle, Clock, ShieldCheck, UserPlus, Users, AlertCircle } from "lucide-react";

export function MetricsCards({ metrics }) {
  const items = [
    { 
      label: "Candidatos", 
      value: metrics.totalCandidatos, 
      icon: Users,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600"
    },
    { 
      label: "Disponibles inmediatos", 
      value: metrics.inmediatos, 
      icon: Clock,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600"
    },
    { 
      label: "Aprobados", 
      value: metrics.aprobados, 
      icon: ShieldCheck,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    { 
      label: "Score promedio", 
      value: `${metrics.scorePromedio}%`, 
      icon: BarChart3,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    { 
      label: "Vacantes activas", 
      value: metrics.vacantesActivas, 
      icon: Briefcase,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600"
    },
    { 
      label: "Aplicaciones recientes", 
      value: metrics.aplicacionesRecientes, 
      icon: UserPlus,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    { 
      label: "Vacantes sin postulantes", 
      value: metrics.vacantesSinPostulantes, 
      icon: AlertCircle,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600"
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {items.map((item, index) => (
        <Motion.div 
          key={item.label} 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: index * 0.05 }}
          whileHover={{ translateY: -4 }}
        >
          <Card className="rounded-2xl shadow-sm border-0 overflow-hidden transition-all hover:shadow-md">
            <div className={`h-1 bg-gradient-to-r ${item.color}`} />
            <CardContent className={`${item.bgColor} p-4 space-y-2`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
                </div>
                <div className={`p-2 rounded-xl bg-white`}>
                  <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </Motion.div>
      ))}
    </div>
  );
}

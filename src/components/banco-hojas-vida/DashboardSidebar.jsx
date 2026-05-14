import { Button } from "@/components/ui/button";
import { BarChart3, Users, UsersRound, Briefcase, Zap } from "lucide-react";
import { motion as Motion } from "framer-motion";

const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "talento",
    label: "Base de Talento",
    icon: Users,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "registro",
    label: "Registrar Candidato",
    icon: UsersRound,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: "vacantes",
    label: "Gestionar Vacantes",
    icon: Briefcase,
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "matching",
    label: "Matching Automático",
    icon: Zap,
    color: "from-pink-500 to-pink-600",
  },
];

export function DashboardSidebar({ activeTab, onTabChange }) {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:overflow-y-auto lg:bg-slate-900 lg:flex lg:flex-col lg:border-r lg:border-slate-800">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
          <span className="text-xl font-bold text-white">BH</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">Banco Hojas Vida</h1>
          <p className="text-xs text-slate-400">Gestión de Talento</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-1 flex-col gap-2 px-3 py-6">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-white" />}
            </Motion.button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="border-t border-slate-800 px-3 py-4">
        <div className="rounded-lg bg-slate-800 p-3 text-xs text-slate-300">
          <p className="font-semibold text-white mb-1">💡 Tips</p>
          <ul className="space-y-1 text-slate-400 text-xs">
            <li>• Carga CVs para análisis automático</li>
            <li>• Crea vacantes para matching</li>
            <li>• Filtra por ciudad o cargo</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

export function DashboardMobileNav({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white lg:hidden">
      <div className="flex justify-around">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium transition-all ${
                isActive
                  ? "text-purple-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { BarChart3, Users, UsersRound, Briefcase, Zap, LogOut } from "lucide-react";
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

export function DashboardSidebar({ activeTab, onTabChange, user, onLogout }) {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:overflow-y-auto lg:bg-gradient-to-b lg:from-teal-900 lg:to-slate-900 lg:flex lg:flex-col lg:border-r lg:border-teal-800">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-teal-800 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white overflow-hidden">
          <img src="/logo-colba.png" alt="Colba Empleos" className="h-8 w-8 object-contain" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">Colba Empleos</h1>
          <p className="text-xs text-teal-300">Portal Reclutador</p>
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
                  : "text-teal-200 hover:bg-teal-800/50 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-white" />}
            </Motion.button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-teal-800 px-3 py-4 space-y-3">
        <div className="rounded-lg bg-teal-800/50 p-3">
          <p className="text-sm font-semibold text-white truncate">{user?.nombre}</p>
          <p className="text-xs text-teal-300 truncate">{user?.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-teal-300 hover:bg-teal-800/50 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export function DashboardMobileNav({ activeTab, onTabChange, user, onLogout }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-teal-200 bg-white lg:hidden">
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
                  ? "text-teal-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
      {/* Mobile user bar */}
      <div className="flex items-center justify-between border-t border-teal-100 px-4 py-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-900 truncate">{user?.nombre}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
        </div>
        <button onClick={onLogout} className="text-slate-400 hover:text-red-500 p-2">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

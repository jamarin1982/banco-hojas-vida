import { Button } from "@/components/ui/button";
import { Plus, Settings, Bell, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function DashboardHeader({ metrics, onNewCandidate, onNewVacante }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.nombre
    ? user.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 p-6 border border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Sistema de gestión de talento e identificación de candidatos
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={onNewCandidate}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Candidato</span>
            <span className="sm:hidden">Candidato</span>
          </Button>
          <Button
            onClick={onNewVacante}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Vacante</span>
            <span className="sm:hidden">Vacante</span>
          </Button>
          <Button size="icon" variant="ghost">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-200 transition-colors"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.nombre}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white">
                  {initials}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                {user?.nombre || "Usuario"}
              </span>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-xl bg-white border border-slate-200 shadow-lg py-1 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user?.nombre}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium capitalize">
                      {user?.rol}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
          <p className="text-xs font-semibold text-blue-600 uppercase">Total</p>
          <p className="mt-2 text-2xl font-bold text-blue-900">{metrics.total}</p>
          <p className="mt-1 text-xs text-blue-700">candidatos</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-100">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Disponibles</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{metrics.inmediatos}</p>
          <p className="mt-1 text-xs text-emerald-700">inmediata</p>
        </div>
        <div className="rounded-lg bg-purple-50 p-4 border border-purple-100">
          <p className="text-xs font-semibold text-purple-600 uppercase">Aprobados</p>
          <p className="mt-2 text-2xl font-bold text-purple-900">{metrics.aprobados}</p>
          <p className="mt-1 text-xs text-purple-700">en proceso</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4 border border-amber-100">
          <p className="text-xs font-semibold text-amber-600 uppercase">Score Promedio</p>
          <p className="mt-2 text-2xl font-bold text-amber-900">{metrics.promedio}%</p>
          <p className="mt-1 text-xs text-amber-700">calidad</p>
        </div>
      </div>
    </div>
  );
}

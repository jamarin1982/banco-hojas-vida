import { Button } from "@/components/ui/button";
import { Plus, Download, Settings, Bell } from "lucide-react";

export function DashboardHeader({ metrics, onNewCandidate, onNewVacante }) {
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
        <div className="flex flex-wrap gap-2">
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
          <Button size="icon" variant="ghost">
            <Settings className="h-5 w-5" />
          </Button>
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

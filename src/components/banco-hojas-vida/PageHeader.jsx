import { Badge } from "@/components/ui/badge";
import { motion as Motion } from "framer-motion";
import { Briefcase } from "lucide-react";

export function PageHeader() {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg"
    >
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white opacity-5" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white opacity-5" />
      
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Banco de Hojas de Vida</h1>
            <p className="mt-1 text-blue-100">MVP para reclutamiento, filtro, scoring y seguimiento de candidatos.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm hover:bg-white/30">
            Grupo Colba - Demo
          </Badge>
          <Badge className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm hover:bg-white/30">
            🔒 Protección de datos
          </Badge>
        </div>
      </div>
    </Motion.div>
  );
}

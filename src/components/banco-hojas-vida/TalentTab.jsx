import { CandidateCard } from "@/components/banco-hojas-vida/CandidateCard";
import { TalentFilters } from "@/components/banco-hojas-vida/TalentFilters";
import { motion as Motion } from "framer-motion";

export function TalentTab({
  query,
  setQuery,
  filterCity,
  setFilterCity,
  filterCargo,
  setFilterCargo,
  candidates,
  filtered,
  statusColor,
  moveStatus,
  setEditingCandidate,
  setActiveTab,
  handleDelete,
  getCvUrl,
  loadingIA,
  onAnalyzeCv,
  vacanteId,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Sidebar de filtros */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200 h-fit sticky top-4">
        <TalentFilters
          query={query}
          setQuery={setQuery}
          filterCity={filterCity}
          setFilterCity={setFilterCity}
          filterCargo={filterCargo}
          setFilterCargo={setFilterCargo}
          candidates={candidates}
        />
      </div>

      {/* Lista de candidatos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">
            {filtered.length} candidato{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white border-2 border-dashed border-slate-300 p-12 text-center">
            <p className="text-slate-500">No se encontraron candidatos con esos filtros</p>
          </div>
        ) : (
          filtered.map((candidate) => (
            <Motion.div key={candidate.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <CandidateCard
                candidate={candidate}
                statusColor={statusColor}
                moveStatus={moveStatus}
                setEditingCandidate={setEditingCandidate}
                setActiveTab={setActiveTab}
                handleDelete={handleDelete}
                getCvUrl={getCvUrl}
                loadingIA={loadingIA}
                onAnalyzeCv={onAnalyzeCv}
                vacanteId={vacanteId}
              />
            </Motion.div>
          ))
        )}
      </div>
    </div>
  );
}

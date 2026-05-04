import { useNavigate } from "react-router";
import { User, Briefcase, Building2, Calendar, ChevronRight, Layers } from "lucide-react";
import type { Individual } from "../types/individuals";
import { formatDate } from "../utils/formatters";

interface IndividualCardProps {
  individual: Individual;
  segmentApiName: string;
}

const IndividualCard = ({ individual, segmentApiName }: IndividualCardProps) => {
  const navigate = useNavigate();

  const initials = ((individual.firstName?.[0] ?? "") + (individual.lastName?.[0] ?? "")).toUpperCase() || "?";

  const relatedEntries = Object.entries(individual.relatedData ?? {}).filter(([, rows]) => rows.length > 0);
  const totalRelatedRecords = relatedEntries.reduce((sum, [, rows]) => sum + rows.length, 0);

  const handleClick = () => {
    const id = individual.unifiedId ?? individual.id;
    if (!id) return;
    navigate(`/segments/${segmentApiName}/individuals/${id}`, { state: { individual } });
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800 hover:border-slate-600 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-semibold text-sm shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-white font-semibold truncate">
              {individual.personName ??
                (`${individual.firstName ?? ""} ${individual.lastName ?? ""}`.trim() || "Unknown")}
            </p>
            <ChevronRight
              size={16}
              className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0"
            />
          </div>
          {individual.salutation && <p className="text-slate-500 text-xs mt-0.5">{individual.salutation}</p>}
          <div className="mt-3 space-y-1.5">
            {individual.titleName && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Briefcase size={13} className="text-slate-500 shrink-0" />
                <span className="truncate">{individual.titleName}</span>
              </div>
            )}
            {individual.currentEmployerName && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Building2 size={13} className="text-slate-500 shrink-0" />
                <span className="truncate">{individual.currentEmployerName}</span>
              </div>
            )}
            {individual.birthDate && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar size={13} className="text-slate-500 shrink-0" />
                <span>{formatDate(individual.birthDate)}</span>
              </div>
            )}
            {!individual.titleName && !individual.currentEmployerName && !individual.birthDate && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User size={13} className="shrink-0" />
                <span>No additional details</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {relatedEntries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-xs text-slate-500">
          <Layers size={13} className="text-blue-400/70" />
          <span>
            {totalRelatedRecords} related record{totalRelatedRecords !== 1 ? "s" : ""} across{" "}
            {relatedEntries.length} data set{relatedEntries.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {individual.dataSourceId && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <span className="text-xs text-slate-600 font-mono">{individual.dataSourceId}</span>
        </div>
      )}
    </button>
  );
};

export default IndividualCard;

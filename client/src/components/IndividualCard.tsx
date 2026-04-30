import { User, Briefcase, Building2, Calendar } from "lucide-react";
import type { Individual } from "../types/individuals";
import { formatDate } from "../utils/formatters";

interface IndividualCardProps {
  individual: Individual;
}

const IndividualCard = ({ individual }: IndividualCardProps) => {
  const initials =
    ((individual.firstName?.[0] ?? "") + (individual.lastName?.[0] ?? "")).toUpperCase() || "?";

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800 hover:border-slate-600 transition-all">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-semibold text-sm shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold">
            {individual.personName ?? (`${individual.firstName ?? ""} ${individual.lastName ?? ""}`.trim() || "Unknown")}
          </p>
          {individual.salutation && (
            <p className="text-slate-500 text-xs mt-0.5">{individual.salutation}</p>
          )}
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
      {individual.dataSourceId && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <span className="text-xs text-slate-600 font-mono">{individual.dataSourceId}</span>
        </div>
      )}
    </div>
  );
};

export default IndividualCard;

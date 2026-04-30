import { useState } from "react";
import { User, Briefcase, Building2, Calendar, ChevronDown, ChevronUp, Database } from "lucide-react";
import type { Individual } from "../types/individuals";
import { formatDate, formatDateTime } from "../utils/formatters";

interface IndividualCardProps {
  individual: Individual;
}

const DMO_LABELS: Record<string, string> = {
  UnifiedssotContactPointEmailInd__dlm: "Email Addresses",
  Page_View__dlm: "Page Views",
};

const dmoLabel = (dmo: string): string => DMO_LABELS[dmo] ?? dmo.replace(/__dlm$/, "").replace(/_/g, " ");

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDateTime(value);
    return value;
  }
  return String(value);
};

const EXCLUDED_KEYS = new Set(["__unified_id__"]);

const RelatedSection = ({ dmo, rows }: { dmo: string; rows: Record<string, unknown>[] }) => {
  const [open, setOpen] = useState(false);
  const visibleKeys = rows.length > 0
    ? Object.keys(rows[0]).filter((k) => !EXCLUDED_KEYS.has(k) && rows.some((r) => r[k] !== null && r[k] !== ""))
    : [];

  return (
    <div className="border border-slate-700/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-700/30 hover:bg-slate-700/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Database size={13} className="text-blue-400 shrink-0" />
          <span className="text-slate-300 text-xs font-medium">{dmoLabel(dmo)}</span>
          <span className="text-xs text-slate-500 bg-slate-700/60 px-1.5 py-0.5 rounded-full">{rows.length}</span>
        </div>
        {open ? <ChevronUp size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/40">
                {visibleKeys.map((key) => (
                  <th key={key} className="px-3 py-2 text-left text-slate-500 font-medium whitespace-nowrap">
                    {key.replace(/^ssot__/, "").replace(/__c$/, "").replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-700/30 last:border-0 hover:bg-slate-700/20">
                  {visibleKeys.map((key) => (
                    <td key={key} className="px-3 py-2 text-slate-400 whitespace-nowrap max-w-48 truncate">
                      {formatCellValue(row[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const IndividualCard = ({ individual }: IndividualCardProps) => {
  const initials =
    ((individual.firstName?.[0] ?? "") + (individual.lastName?.[0] ?? "")).toUpperCase() || "?";

  const relatedEntries = Object.entries(individual.relatedData ?? {}).filter(([, rows]) => rows.length > 0);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all">
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

      {relatedEntries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
          {relatedEntries.map(([dmo, rows]) => (
            <RelatedSection key={dmo} dmo={dmo} rows={rows} />
          ))}
        </div>
      )}

      {individual.dataSourceId && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <span className="text-xs text-slate-600 font-mono">{individual.dataSourceId}</span>
        </div>
      )}
    </div>
  );
};

export default IndividualCard;

import { useMemo, useState } from "react";
import { Search, Database, Columns3, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { formatDateTime } from "../utils/formatters";

interface RelatedDataExplorerProps {
  relatedData: Record<string, Record<string, unknown>[]>;
}

const DMO_LABELS: Record<string, string> = {
  UnifiedssotContactPointEmailInd__dlm: "Email Addresses",
  Page_View__dlm: "Page Views",
};

const dmoLabel = (dmo: string): string => DMO_LABELS[dmo] ?? dmo.replace(/__dlm$/, "").replace(/_/g, " ");

const EXCLUDED_KEYS = new Set(["__unified_id__"]);

const prettifyKey = (key: string): string =>
  key
    .replace(/^ssot__/, "")
    .replace(/__c$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDateTime(value);
    return value;
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

const getRowSearchBlob = (row: Record<string, unknown>): string =>
  Object.values(row)
    .map((v) => (v === null || v === undefined ? "" : String(v)))
    .join(" ")
    .toLowerCase();

type SortDirection = "asc" | "desc" | null;

const RelatedDataExplorer = ({ relatedData }: RelatedDataExplorerProps) => {
  const dmos = useMemo(() => Object.keys(relatedData), [relatedData]);
  const [activeDmo, setActiveDmo] = useState<string>(dmos[0] ?? "");

  if (dmos.length === 0 || !activeDmo) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
      <aside className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-2 h-fit md:sticky md:top-20">
        <div className="px-2 py-2 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
          Data sets
        </div>
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {dmos.map((dmo) => {
            const isActive = dmo === activeDmo;
            return (
              <button
                key={dmo}
                onClick={() => setActiveDmo(dmo)}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors shrink-0 md:shrink ${
                  isActive
                    ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Database size={13} className={isActive ? "text-blue-400 shrink-0" : "text-slate-500 shrink-0"} />
                  <span className="truncate">{dmoLabel(dmo)}</span>
                </div>
                <span
                  className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                    isActive ? "bg-blue-500/20 text-blue-300" : "bg-slate-700/60 text-slate-400"
                  }`}
                >
                  {relatedData[dmo].length}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <DataSetTable key={activeDmo} dmo={activeDmo} rows={relatedData[activeDmo]} />
    </div>
  );
};

interface DataSetTableProps {
  dmo: string;
  rows: Record<string, unknown>[];
}

const DataSetTable = ({ dmo, rows }: DataSetTableProps) => {
  const allKeys = useMemo(() => {
    if (rows.length === 0) return [];
    const seen = new Set<string>();
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        if (!EXCLUDED_KEYS.has(key)) seen.add(key);
      }
    }
    return Array.from(seen).filter((k) => rows.some((r) => r[k] !== null && r[k] !== ""));
  }, [rows]);

  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const visibleColumns = useMemo(
    () => allKeys.filter((k) => !hiddenColumns.has(k)),
    [allKeys, hiddenColumns],
  );

  const searchedRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => getRowSearchBlob(r).includes(q));
  }, [rows, search]);

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDir) return searchedRows;
    const copy = [...searchedRows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      if (av === null || av === undefined || av === "") return 1;
      if (bv === null || bv === undefined || bv === "") return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const as = String(av);
      const bs = String(bv);
      return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });
    return copy;
  }, [searchedRows, sortKey, sortDir]);

  const toggleColumn = (key: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const cycleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    if (sortDir === "asc") {
      setSortDir("desc");
      return;
    }
    setSortKey(null);
    setSortDir(null);
  };

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown size={11} className="text-slate-600 opacity-0 group-hover:opacity-100" />;
    if (sortDir === "asc") return <ArrowUp size={11} className="text-blue-400" />;
    if (sortDir === "desc") return <ArrowDown size={11} className="text-blue-400" />;
    return null;
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-white font-semibold text-base truncate">{dmoLabel(dmo)}</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">{dmo}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id={`search-${dmo}`}
              type="text"
              placeholder="Search records…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setColumnPickerOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/50 text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            >
              <Columns3 size={14} />
              <span className="hidden sm:inline">Columns</span>
              <span className="text-slate-500">
                {visibleColumns.length}/{allKeys.length}
              </span>
            </button>
            {columnPickerOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setColumnPickerOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full mt-2 z-20 w-64 max-h-80 overflow-y-auto bg-slate-900 border border-slate-700/60 rounded-lg shadow-xl p-1.5">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <button
                      onClick={() => setHiddenColumns(new Set())}
                      className="text-[11px] text-blue-400 hover:text-blue-300"
                    >
                      Show all
                    </button>
                    <button
                      onClick={() => setHiddenColumns(new Set(allKeys))}
                      className="text-[11px] text-slate-500 hover:text-slate-300"
                    >
                      Hide all
                    </button>
                  </div>
                  {allKeys.map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-800 cursor-pointer"
                    >
                      <input
                        id={`col-${dmo}-${key}`}
                        type="checkbox"
                        checked={!hiddenColumns.has(key)}
                        onChange={() => toggleColumn(key)}
                        className="accent-blue-500"
                      />
                      <span className="text-xs text-slate-300 truncate">{prettifyKey(key)}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-slate-700/50 text-xs text-slate-500 bg-slate-900/30">
        Showing {sortedRows.length} of {rows.length} record{rows.length !== 1 ? "s" : ""}
        {search && ` matching "${search}"`}
      </div>

      <div className="overflow-x-auto">
        {sortedRows.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Search size={28} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No records match your search.</p>
          </div>
        ) : visibleColumns.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Columns3 size={28} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">All columns are hidden. Use the Columns menu to show some.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-900/40">
              <tr className="border-b border-slate-700/50">
                {visibleColumns.map((key) => (
                  <th
                    key={key}
                    className="px-4 py-2.5 text-left text-[11px] uppercase tracking-wider text-slate-500 font-medium whitespace-nowrap"
                  >
                    <button
                      onClick={() => cycleSort(key)}
                      className="group flex items-center gap-1.5 hover:text-slate-300 transition-colors"
                    >
                      {prettifyKey(key)}
                      {renderSortIcon(key)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-700/30 last:border-0 hover:bg-slate-700/20 transition-colors"
                >
                  {visibleColumns.map((key) => (
                    <td key={key} className="px-4 py-2.5 text-slate-300 align-top">
                      <div className="max-w-xs wrap-break-word">{formatCellValue(row[key])}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RelatedDataExplorer;

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { Loader2, AlertCircle, ArrowLeft, Users, Search, RefreshCw } from "lucide-react";
import type { Individual } from "../types/individuals";
import { fetchIndividuals } from "../services/apiService";
import IndividualCard from "../components/IndividualCard";

const IndividualsPage = () => {
  const { segmentApiName } = useParams<{ segmentApiName: string }>();
  const navigate = useNavigate();

  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(
    async (force: boolean) => {
      if (!segmentApiName) return;
      try {
        if (force) setRefreshing(true);
        const data = await fetchIndividuals(segmentApiName, force);
        setIndividuals(data.individuals);
        setTotalCount(data.totalCount);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [segmentApiName],
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const filtered = useMemo(
    () =>
      individuals.filter((ind) => {
        const q = search.toLowerCase();
        return (
          ind.firstName?.toLowerCase().includes(q) ||
          ind.lastName?.toLowerCase().includes(q) ||
          ind.personName?.toLowerCase().includes(q) ||
          ind.titleName?.toLowerCase().includes(q) ||
          ind.currentEmployerName?.toLowerCase().includes(q) ||
          ind.dataSourceId?.toLowerCase().includes(q)
        );
      }),
    [individuals, search],
  );

  if (loading) {
    return (
      <>
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <Loader2 size={36} className="animate-spin text-blue-500" />
            <p>Resolving individuals…</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Failed to load individuals</p>
              <p className="text-slate-400 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={14} /> Go back
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={14} /> Back to segments
          </button>

          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Users size={24} className="text-blue-500 shrink-0" />
                <h1 className="text-3xl font-bold text-white truncate">{segmentApiName}</h1>
              </div>
              <p className="text-slate-400 mt-1">
                {totalCount} individual{totalCount !== 1 ? "s" : ""} in this segment
              </p>
            </div>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-60 shrink-0"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "Refreshing…" : "Refresh"}</span>
            </button>
          </div>

          <div className="relative mb-6">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="individual-search"
              type="text"
              placeholder="Search by name, title, employer, or source…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <Search size={36} className="mx-auto mb-4 opacity-40" />
              <p>No individuals match your search.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((individual, i) => (
                <IndividualCard
                  key={individual.id ?? i}
                  individual={individual}
                  segmentApiName={segmentApiName ?? ""}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default IndividualsPage;

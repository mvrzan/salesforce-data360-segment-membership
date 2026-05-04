import { useState, useEffect, useMemo, useCallback } from "react";
import { Loader2, AlertCircle, Search, Layers, RefreshCw } from "lucide-react";
import type { Segment } from "../types/segments";
import { fetchSegments } from "../services/apiService";
import SegmentCard from "../components/SegmentCard";

const SegmentsPage = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async (force: boolean) => {
    try {
      if (force) setRefreshing(true);
      const data = await fetchSegments(force);
      setSegments(data.segments);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const filtered = useMemo(
    () =>
      segments.filter(
        (s) =>
          s.displayName.toLowerCase().includes(search.toLowerCase()) ||
          s.apiName.toLowerCase().includes(search.toLowerCase()) ||
          s.description?.toLowerCase().includes(search.toLowerCase()),
      ),
    [segments, search],
  );

  if (loading) {
    return (
      <>
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <Loader2 size={36} className="animate-spin text-blue-500" />
            <p>Loading segments…</p>
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
              <p className="text-white font-semibold text-lg">Failed to load segments</p>
              <p className="text-slate-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Layers size={24} className="text-blue-500 shrink-0" />
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Segments</h1>
              </div>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">
                {segments.length} segment{segments.length !== 1 ? "s" : ""} in Data 360
              </p>
            </div>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="self-start flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-60 shrink-0"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "Refreshing…" : "Refresh"}</span>
            </button>
          </div>

          <div className="relative mb-6">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="segment-search"
              type="text"
              placeholder="Search segments…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <Search size={36} className="mx-auto mb-4 opacity-40" />
              <p>No segments match your search.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((segment) => (
                <SegmentCard key={segment.marketSegmentId} segment={segment} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default SegmentsPage;

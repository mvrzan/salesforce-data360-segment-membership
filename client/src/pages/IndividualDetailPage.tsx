import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  ArrowLeft,
  User,
  Briefcase,
  Building2,
  Calendar,
  Hash,
  Database,
  Loader2,
  AlertCircle,
  Table as TableIcon,
  Layers,
} from "lucide-react";
import type { Individual } from "../types/individuals";
import { fetchIndividuals } from "../services/apiService";
import { formatDate } from "../utils/formatters";
import RelatedDataExplorer from "../components/RelatedDataExplorer";

interface LocationState {
  individual?: Individual;
}

const IndividualDetailPage = () => {
  const { segmentApiName, individualId } = useParams<{ segmentApiName: string; individualId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const preloaded = (location.state as LocationState | null)?.individual ?? null;

  const [individual, setIndividual] = useState<Individual | null>(preloaded);
  const [loading, setLoading] = useState(!preloaded);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preloaded || !segmentApiName || !individualId) return;

    const load = async () => {
      try {
        const data = await fetchIndividuals(segmentApiName);
        const match = data.individuals.find((i) => i.unifiedId === individualId || i.id === individualId);
        if (!match) {
          setError("Individual not found in this segment.");
          return;
        }
        setIndividual(match);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [preloaded, segmentApiName, individualId]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 size={36} className="animate-spin text-blue-500" />
          <p>Loading individual…</p>
        </div>
      </main>
    );
  }

  if (error || !individual) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">Unable to load individual</p>
            <p className="text-slate-400 text-sm mt-1">{error ?? "Missing data."}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={14} /> Go back
          </button>
        </div>
      </main>
    );
  }

  return <IndividualDetail individual={individual} onBack={() => navigate(-1)} />;
};

interface IndividualDetailProps {
  individual: Individual;
  onBack: () => void;
}

const IndividualDetail = ({ individual, onBack }: IndividualDetailProps) => {
  const initials = ((individual.firstName?.[0] ?? "") + (individual.lastName?.[0] ?? "")).toUpperCase() || "?";

  const displayName =
    individual.personName ?? (`${individual.firstName ?? ""} ${individual.lastName ?? ""}`.trim() || "Unknown");

  const relatedEntries = useMemo(
    () => Object.entries(individual.relatedData ?? {}).filter(([, rows]) => rows.length > 0),
    [individual],
  );

  const totalRelatedRecords = relatedEntries.reduce((sum, [, rows]) => sum + rows.length, 0);

  return (
    <main className="flex-1">
      <div className="max-w-400 mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-6 sm:mb-8"
        >
          <ArrowLeft size={14} /> Back to segment members
        </button>

        <section className="relative overflow-hidden bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-4 sm:gap-6">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/40 text-blue-300 font-bold text-xl sm:text-2xl shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white wrap-break-word">{displayName}</h1>
              {individual.salutation && (
                <p className="text-slate-400 text-sm mt-1">{individual.salutation}</p>
              )}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <InfoField icon={<Briefcase size={14} />} label="Title" value={individual.titleName} />
                <InfoField icon={<Building2 size={14} />} label="Employer" value={individual.currentEmployerName} />
                <InfoField
                  icon={<Calendar size={14} />}
                  label="Birth date"
                  value={individual.birthDate ? formatDate(individual.birthDate) : null}
                />
                <InfoField
                  icon={<User size={14} />}
                  label="Primary account"
                  value={individual.primaryAccountId}
                  mono
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <StatCard
            icon={<Hash size={16} />}
            label="Unified ID"
            value={individual.unifiedId ?? "—"}
            mono
          />
          <StatCard icon={<Database size={16} />} label="Source ID" value={individual.id ?? "—"} mono />
          <StatCard
            icon={<Layers size={16} />}
            label="Related records"
            value={`${totalRelatedRecords} across ${relatedEntries.length} data set${relatedEntries.length !== 1 ? "s" : ""}`}
          />
        </section>

        {relatedEntries.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 border border-slate-700/50 rounded-xl text-slate-500">
            <TableIcon size={36} className="mx-auto mb-4 opacity-40" />
            <p>No related data sets for this individual.</p>
          </div>
        ) : (
          <RelatedDataExplorer relatedData={Object.fromEntries(relatedEntries)} />
        )}
      </div>
    </main>
  );
};

interface InfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  mono?: boolean;
}

const InfoField = ({ icon, label, value, mono }: InfoFieldProps) => (
  <div className="min-w-0">
    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
      <span className="text-slate-500">{icon}</span>
      {label}
    </div>
    <p className={`mt-1 text-sm text-slate-200 truncate ${mono ? "font-mono text-xs" : ""}`}>
      {value && value.trim() ? value : <span className="text-slate-600">—</span>}
    </p>
  </div>
);

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}

const StatCard = ({ icon, label, value, mono }: StatCardProps) => (
  <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3">
    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
      <span className="text-blue-400">{icon}</span>
      {label}
    </div>
    <p className={`mt-1 text-sm text-slate-200 truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
  </div>
);

export default IndividualDetailPage;

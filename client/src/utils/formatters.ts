export const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const formatDateTime = (iso: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_MAP: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DRAFT: "Draft",
  SUCCESS: "Success",
  FAILED: "Failed",
  PENDING: "Pending",
};

export const formatStatus = (status: string): string => STATUS_MAP[status] ?? status;

const PUBLISH_STATUS_COLORS: Record<string, string> = {
  SUCCESS: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  FAILED: "bg-red-500/20 text-red-400 border border-red-500/30",
  PENDING: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  ACTIVE: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  INACTIVE: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  DRAFT: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
};

export const getStatusClasses = (status: string): string =>
  PUBLISH_STATUS_COLORS[status] ?? "bg-slate-500/20 text-slate-400 border border-slate-500/30";

import { Users, Calendar, RefreshCw, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import type { Segment } from "../types/segments";
import { formatDateTime, formatStatus, getStatusClasses } from "../utils/formatters";

interface SegmentCardProps {
  segment: Segment;
}

const SegmentCard = ({ segment }: SegmentCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/segments/${segment.apiName}`)}
      className="w-full text-left bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:bg-slate-800 hover:border-slate-600 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <h3 className="text-white font-semibold text-base sm:text-lg wrap-break-word min-w-0">{segment.displayName}</h3>
            <span className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusClasses(segment.publishStatus)}`}>
              {formatStatus(segment.publishStatus)}
            </span>
          </div>
          {segment.description && (
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">{segment.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users size={14} className="shrink-0" />
              <span>{(segment.lastSegmentMemberCount ?? 0).toLocaleString()} members</span>
            </span>
            <span className="flex items-center gap-1.5 min-w-0">
              <Calendar size={14} className="shrink-0" />
              <span className="truncate">Published {formatDateTime(segment.lastPublishedEndDateTime)}</span>
            </span>
            <span className="flex items-center gap-1.5 min-w-0">
              <RefreshCw size={14} className="shrink-0" />
              <span className="truncate">{segment.publishInterval === "NO_REFRESH" ? "No auto-refresh" : segment.publishInterval}</span>
            </span>
          </div>
        </div>
        <ChevronRight size={20} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-1" />
      </div>
      <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-xs text-slate-600 font-mono wrap-break-word min-w-0">{segment.apiName}</span>
        <span className="text-slate-700 hidden sm:inline">·</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${getStatusClasses(segment.segmentStatus)}`}>
          {formatStatus(segment.segmentStatus)}
        </span>
      </div>
    </button>
  );
};

export default SegmentCard;

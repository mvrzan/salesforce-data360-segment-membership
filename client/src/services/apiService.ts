import type { SegmentsResponse } from "../types/segments";
import type { IndividualsResponse } from "../types/individuals";

const BASE_URL = "/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY as string | undefined;

let segmentsCache: SegmentsResponse | null = null;
const individualsCache = new Map<string, IndividualsResponse>();

const buildHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {};
  if (API_KEY) headers["x-api-key"] = API_KEY;
  return headers;
};

export const fetchSegments = async (force = false): Promise<SegmentsResponse> => {
  if (!force && segmentsCache) return segmentsCache;

  const response = await fetch(`${BASE_URL}/segments`, { headers: buildHeaders() });
  if (!response.ok) throw new Error(`Failed to fetch segments: ${response.statusText}`);

  segmentsCache = (await response.json()) as SegmentsResponse;
  return segmentsCache;
};

export const fetchIndividuals = async (segmentApiName: string, force = false): Promise<IndividualsResponse> => {
  if (!force) {
    const cached = individualsCache.get(segmentApiName);
    if (cached) return cached;
  }

  const response = await fetch(`${BASE_URL}/segments/${encodeURIComponent(segmentApiName)}/individuals`, {
    headers: buildHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch individuals: ${response.statusText}`);

  const data = (await response.json()) as IndividualsResponse;
  individualsCache.set(segmentApiName, data);
  return data;
};

export const invalidateSegmentsCache = (): void => {
  segmentsCache = null;
};

export const invalidateIndividualsCache = (segmentApiName?: string): void => {
  if (segmentApiName) {
    individualsCache.delete(segmentApiName);
    return;
  }
  individualsCache.clear();
};

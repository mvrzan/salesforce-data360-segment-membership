import type { SegmentsResponse } from "../types/segments";
import type { IndividualsResponse } from "../types/individuals";

const BASE_URL = "/api/v1";

let segmentsCache: SegmentsResponse | null = null;
const individualsCache = new Map<string, IndividualsResponse>();

export const fetchSegments = async (force = false): Promise<SegmentsResponse> => {
  if (!force && segmentsCache) return segmentsCache;

  const response = await fetch(`${BASE_URL}/segments`);
  if (!response.ok) throw new Error(`Failed to fetch segments: ${response.statusText}`);

  segmentsCache = (await response.json()) as SegmentsResponse;
  return segmentsCache;
};

export const fetchIndividuals = async (segmentApiName: string, force = false): Promise<IndividualsResponse> => {
  if (!force) {
    const cached = individualsCache.get(segmentApiName);
    if (cached) return cached;
  }

  const response = await fetch(`${BASE_URL}/segments/${encodeURIComponent(segmentApiName)}/individuals`);
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

import type { SegmentsResponse } from "../types/segments";
import type { IndividualsResponse } from "../types/individuals";

const BASE_URL = "/api/v1";

export const fetchSegments = async (): Promise<SegmentsResponse> => {
  const response = await fetch(`${BASE_URL}/segments`);
  if (!response.ok) throw new Error(`Failed to fetch segments: ${response.statusText}`);
  return response.json();
};

export const fetchIndividuals = async (segmentApiName: string): Promise<IndividualsResponse> => {
  const response = await fetch(`${BASE_URL}/segments/${encodeURIComponent(segmentApiName)}/individuals`);
  if (!response.ok) throw new Error(`Failed to fetch individuals: ${response.statusText}`);
  return response.json();
};

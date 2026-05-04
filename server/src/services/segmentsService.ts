import { getRequiredEnvVars } from "../utils/env.ts";
import { logger } from "../utils/loggingUtil.ts";
import getSalesforceToken from "./salesforceAuth.ts";
import type { Segment, SegmentsResponse, SegmentMembersResponse } from "../types/segments.ts";

const MODULE = "segmentsService";

const { SF_INSTANCE_URL, API_VERSION } = getRequiredEnvVars("SF_INSTANCE_URL", "API_VERSION");

const getSegments = async (): Promise<SegmentsResponse> => {
  const token = await getSalesforceToken();

  const response = await fetch(`${SF_INSTANCE_URL}/services/data/${API_VERSION}/ssot/segments`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(MODULE, `Failed to fetch segments: ${response.status} - ${errorText}`);
    throw new Error(`Failed to fetch segments: ${response.statusText}`);
  }

  const data = (await response.json()) as SegmentsResponse;

  data.segments = data.segments.map((segment) => {
    const raw = segment.includeCriteria as unknown;
    if (typeof raw !== "string") return segment;
    const decoded = raw.replace(/&quot;/g, '"');
    return { ...segment, includeCriteria: JSON.parse(decoded) };
  });

  return data;
};

const getSegmentMembers = async (segmentApiName: string): Promise<SegmentMembersResponse> => {
  const token = await getSalesforceToken();

  const params = new URLSearchParams({
    startTime: "1970-01-01T00:00:00Z",
    endTime: new Date().toISOString(),
  });

  const response = await fetch(
    `${SF_INSTANCE_URL}/services/data/${API_VERSION}/ssot/segments/${encodeURIComponent(segmentApiName)}/members?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(MODULE, `Failed to fetch members for segment "${segmentApiName}": ${response.status} - ${errorText}`);
    throw new Error(`Failed to fetch segment members: ${response.statusText}`);
  }

  return (await response.json()) as SegmentMembersResponse;
};

const getSegmentByApiName = async (segmentApiName: string): Promise<Segment> => {
  const data = await getSegments();
  const segment = data.segments.find((s) => s.apiName === segmentApiName);
  if (!segment) throw new Error(`Segment "${segmentApiName}" not found`);
  return segment;
};

export { getSegments, getSegmentMembers, getSegmentByApiName };

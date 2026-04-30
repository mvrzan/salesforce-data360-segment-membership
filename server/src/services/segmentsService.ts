import { getRequiredEnvVars } from "../utils/env.ts";
import { logger } from "../utils/loggingUtil.ts";
import getSalesforceToken from "./salesforceAuth.ts";
import type { SegmentsResponse, SegmentMembersResponse } from "../types/segments.ts";

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
    const decoded = (segment.includeCriteria as string).replace(/&quot;/g, '"');
    return { ...segment, includeCriteria: JSON.parse(decoded) };
  });

  return data;
};

const getSegmentMembers = async (segmentApiName: string): Promise<SegmentMembersResponse> => {
  const token = await getSalesforceToken();

  const response = await fetch(
    `${SF_INSTANCE_URL}/services/data/${API_VERSION}/ssot/segments/${encodeURIComponent(segmentApiName)}/members`,
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

export { getSegments, getSegmentMembers };

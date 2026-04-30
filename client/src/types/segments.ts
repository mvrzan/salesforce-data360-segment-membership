export interface Segment {
  apiName: string;
  createdBy: { id: string };
  createdDate: string;
  dataSpace: string;
  description: string;
  displayName: string;
  includeCriteria: unknown;
  lastModifiedBy: { id: string };
  lastModifiedDate: string;
  lastPublishedEndDateTime: string;
  lastSegmentMemberCount: number;
  lookbackPeriod: string;
  marketSegmentDefinitionId: string;
  marketSegmentId: string;
  parameters: unknown[];
  publishInterval: string;
  publishStatus: string;
  segmentMembershipTable: string;
  segmentOnApiName: string;
  segmentOnId: string;
  segmentStatus: string;
  segmentType: string;
}

export interface SegmentsResponse {
  batchSize: number;
  offset: number;
  orderByExpression: string;
  segments: Segment[];
  totalSize: number;
}

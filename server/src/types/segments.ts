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

export interface SegmentMember {
  deltaType: string;
  id: string;
  snapshotType: string;
  timestamp: string;
  versionStamp: string;
}

export interface SegmentMembersResponse {
  data: SegmentMember[];
  endTime: string;
  filter: string;
  limit: number;
  offSet: number;
  orderBy: string;
  rowCount: number;
  startTime: string;
  totalCount: number;
}

interface CriteriaSubject {
  objectApiName: string;
  fieldApiName: string;
}

type PathStep = [CriteriaSubject, CriteriaSubject];

interface DirectFilter {
  type: "TextComparison" | "NumberComparison" | "DateComparison";
  path: PathStep[] | null;
  joinPath: PathStep[] | null;
  subject: CriteriaSubject;
  selfReference: boolean;
  operator: string;
  subjectFieldDataType: string;
  subjectFieldBusinessType: string;
  subjectFieldSourceType: "DIRECT" | "RELATED" | null;
  value?: number | string;
}

interface RelatedFilter {
  type: "NumberAggregation" | "DateAggregation";
  filter: DirectFilter;
  containerObjectApiName: string;
  path: PathStep[][];
  joinPath: PathStep[][];
  aggregateFunction: string;
  comparison: DirectFilter;
  hierarchySelected: boolean;
  hierarchicalPathList: unknown;
  innerAggregationEnabled: boolean;
  innerAggregationSubject: unknown;
  outerAggregationFunction: string | null;
  outerComparison: DirectFilter | null;
}

type CriteriaFilter = DirectFilter | RelatedFilter;

export interface IncludeCriteria {
  type: "LogicalComparison";
  operator: "and" | "or";
  filters: CriteriaFilter[];
}

export interface Segment {
  apiName: string;
  createdBy: { id: string };
  createdDate: string;
  dataSpace: string;
  description: string;
  displayName: string;
  includeCriteria: IncludeCriteria;
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

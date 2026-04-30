export interface Individual {
  id: string | null;
  unifiedId: string | null;
  firstName: string | null;
  lastName: string | null;
  personName: string | null;
  salutation: string | null;
  birthDate: string | null;
  titleName: string | null;
  primaryAccountId: string | null;
  currentEmployerName: string | null;
  dataSourceId: string | null;
  dataSourceObjectId: string | null;
  photoUrl: string | null;
  relatedData: Record<string, Record<string, unknown>[]>;
}

export interface IndividualsResponse {
  individuals: Individual[];
  totalCount: number;
}

export interface QueryApiMetadataField {
  name: string;
  nullable: boolean;
  type: string;
}

export interface QueryApiResponse {
  data: unknown[][];
  metadata: QueryApiMetadataField[];
  returnedRows: number;
  status: {
    rowCount: number;
    queryId: string;
    completionStatus: string;
  };
}

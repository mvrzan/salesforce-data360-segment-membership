import { getRequiredEnvVars } from "../utils/env.ts";
import { logger } from "../utils/loggingUtil.ts";
import getSalesforceToken from "./salesforceAuth.ts";
import { getSegmentMembers } from "./segmentsService.ts";
import type { Individual, IndividualsResponse, QueryApiResponse } from "../types/individuals.ts";

const MODULE = "individualsService";

const { SF_INSTANCE_URL, API_VERSION, UNIFIED_INDIVIDUAL_DMO, UNIFIED_LINK_INDIVIDUAL_DMO } = getRequiredEnvVars(
  "SF_INSTANCE_URL",
  "API_VERSION",
  "UNIFIED_INDIVIDUAL_DMO",
  "UNIFIED_LINK_INDIVIDUAL_DMO",
);

const getIndividualsForSegment = async (segmentApiName: string): Promise<IndividualsResponse> => {
  const [token, membersResponse] = await Promise.all([getSalesforceToken(), getSegmentMembers(segmentApiName)]);

  if (membersResponse.data.length === 0) {
    return { individuals: [], totalCount: 0 };
  }

  const unifiedIds = membersResponse.data.map((m) => `'${m.id}'`).join(", ");

  const sql = `SELECT DISTINCT i.* FROM ${UNIFIED_INDIVIDUAL_DMO} u JOIN ${UNIFIED_LINK_INDIVIDUAL_DMO} l ON u.ssot__Id__c = l.UnifiedRecordId__c JOIN ssot__Individual__dlm i ON l.SourceRecordId__c = i.ssot__Id__c WHERE u.ssot__Id__c IN (${unifiedIds})`;

  logger.debug(MODULE, `Executing SQL: ${sql}`);

  const response = await fetch(`${SF_INSTANCE_URL}/services/data/${API_VERSION}/ssot/query-sql`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(MODULE, `Query API failed for segment "${segmentApiName}": ${response.status} - ${errorText}`);
    throw new Error(`Failed to query individuals: ${response.statusText}`);
  }

  const queryResult = (await response.json()) as QueryApiResponse;

  const fieldNames = queryResult.metadata.map((f) => f.name);

  const toRow = (values: unknown[]): Record<string, unknown> =>
    Object.fromEntries(fieldNames.map((name, i) => [name, values[i] ?? null]));

  const individuals: Individual[] = queryResult.data.map((values) => {
    const row = toRow(values);
    return {
      id: (row["ssot__Id__c"] as string) ?? null,
      firstName: (row["ssot__FirstName__c"] as string) ?? null,
      lastName: (row["ssot__LastName__c"] as string) ?? null,
      personName: (row["ssot__PersonName__c"] as string) ?? null,
      salutation: (row["ssot__Salutation__c"] as string) ?? null,
      birthDate: (row["ssot__BirthDate__c"] as string) ?? null,
      titleName: (row["ssot__TitleName__c"] as string) ?? null,
      primaryAccountId: (row["ssot__PrimaryAccountId__c"] as string) ?? null,
      currentEmployerName: (row["ssot__CurrentEmployerName__c"] as string) ?? null,
      dataSourceId: (row["ssot__DataSourceId__c"] as string) ?? null,
      dataSourceObjectId: (row["ssot__DataSourceObjectId__c"] as string) ?? null,
      photoUrl: (row["ssot__PhotoURL__c"] as string) ?? null,
    };
  });

  return { individuals, totalCount: queryResult.status.rowCount };
};

export { getIndividualsForSegment };

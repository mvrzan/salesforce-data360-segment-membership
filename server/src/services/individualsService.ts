import { getRequiredEnvVars } from "../utils/env.ts";
import { logger } from "../utils/loggingUtil.ts";
import getSalesforceToken from "./salesforceAuth.ts";
import { getSegmentMembers, getSegmentByApiName } from "./segmentsService.ts";
import type { Individual, IndividualsResponse, QueryApiResponse } from "../types/individuals.ts";
import type { RelatedFilter } from "../types/segments.ts";

const MODULE = "individualsService";

const { SF_INSTANCE_URL, API_VERSION, UNIFIED_INDIVIDUAL_DMO, UNIFIED_LINK_INDIVIDUAL_DMO } = getRequiredEnvVars(
  "SF_INSTANCE_URL",
  "API_VERSION",
  "UNIFIED_INDIVIDUAL_DMO",
  "UNIFIED_LINK_INDIVIDUAL_DMO",
);

const SOURCE_INDIVIDUAL_DMO = "ssot__Individual__dlm";

const runQuery = async (token: string, sql: string): Promise<QueryApiResponse> => {
  const response = await fetch(`${SF_INSTANCE_URL}/services/data/${API_VERSION}/ssot/query-sql`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(MODULE, `Query API failed: ${response.status} - ${errorText}`);
    throw new Error(`Query failed: ${response.statusText}`);
  }

  return (await response.json()) as QueryApiResponse;
};

const toRowMap = (result: QueryApiResponse): Record<string, unknown>[] => {
  if (!result.metadata || !result.data) return [];
  const fieldNames = result.metadata.map((f) => f.name);
  return result.data.map((values) => Object.fromEntries(fieldNames.map((name, i) => [name, values[i] ?? null])));
};

// Returns unique RelatedFilters, deduplicated by containerObjectApiName
const extractRelatedFilters = (filters: RelatedFilter[]): RelatedFilter[] => {
  const seen = new Set<string>();
  return filters.filter((f) => {
    if (seen.has(f.containerObjectApiName)) return false;
    seen.add(f.containerObjectApiName);
    return true;
  });
};

// Determines which join key to use when querying the related DMO.
// The last PathStep is [leftSubject, rightSubject] where rightSubject is the container DMO field.
// If the left side is UNIFIED_INDIVIDUAL_DMO (e.g. email), join on unified ID.
// Otherwise (e.g. Page_View__dlm via ssot__Individual__dlm), join on source record ID.
const getJoinKey = (filter: RelatedFilter): "unifiedId" | "sourceRecordId" => {
  const lastStep = filter.path[filter.path.length - 1];
  if (!lastStep) return "sourceRecordId";
  return lastStep[0].objectApiName === UNIFIED_INDIVIDUAL_DMO ? "unifiedId" : "sourceRecordId";
};

const getIndividualsForSegment = async (segmentApiName: string): Promise<IndividualsResponse> => {
  const [token, membersResponse, segment] = await Promise.all([
    getSalesforceToken(),
    getSegmentMembers(segmentApiName),
    getSegmentByApiName(segmentApiName),
  ]);

  if (membersResponse.data.length === 0) {
    return { individuals: [], totalCount: 0 };
  }

  const unifiedIds = membersResponse.data.map((m) => m.id);
  const unifiedIdsInClause = unifiedIds.map((id) => `'${id}'`).join(", ");

  // Base query: fetch source individual records + alias the unified ID for later joining
  const baseSql = `SELECT DISTINCT i.*, u.ssot__Id__c AS __unified_id__ FROM ${UNIFIED_INDIVIDUAL_DMO} u JOIN ${UNIFIED_LINK_INDIVIDUAL_DMO} l ON u.ssot__Id__c = l.UnifiedRecordId__c JOIN ${SOURCE_INDIVIDUAL_DMO} i ON l.SourceRecordId__c = i.ssot__Id__c WHERE u.ssot__Id__c IN (${unifiedIdsInClause})`;

  const baseResult = await runQuery(token, baseSql);
  const baseRows = toRowMap(baseResult);

  // Build lookup maps for joining related data
  const sourceIdToUnifiedId = new Map<string, string>();
  const unifiedIdToSourceIds = new Map<string, string[]>();
  for (const row of baseRows) {
    const srcId = row["ssot__Id__c"] as string;
    const uniId = row["__unified_id__"] as string;
    if (srcId && uniId) {
      sourceIdToUnifiedId.set(srcId, uniId);
      const existing = unifiedIdToSourceIds.get(uniId) ?? [];
      existing.push(srcId);
      unifiedIdToSourceIds.set(uniId, existing);
    }
  }

  // Extract related DMOs from segment criteria
  const criteriaFilters = (segment.includeCriteria?.filters ?? []) as RelatedFilter[];
  const relatedFilters = extractRelatedFilters(
    criteriaFilters.filter((f) => f.type === "NumberAggregation" || f.type === "DateAggregation"),
  );

  // Query each related DMO in parallel
  const relatedResults = await Promise.allSettled(
    relatedFilters.map(async (filter) => {
      const joinKey = getJoinKey(filter);
      const lastStep = filter.path[filter.path.length - 1];
      const joinFieldApiName = lastStep?.[1]?.fieldApiName;

      const ids =
        joinKey === "unifiedId"
          ? unifiedIds
          : [...new Set(baseRows.map((r) => r["ssot__Id__c"] as string).filter(Boolean))];

      const idsInClause = ids.map((id) => `'${id}'`).join(", ");
      const sql = `SELECT * FROM ${filter.containerObjectApiName} WHERE ${joinFieldApiName} IN (${idsInClause})`;

      const result = await runQuery(token, sql);
      return { filter, rows: toRowMap(result), joinKey, joinFieldApiName };
    }),
  );

  // Build a map: unifiedId → { containerDMO: rows[] }
  const relatedByUnifiedId = new Map<string, Record<string, Record<string, unknown>[]>>();

  for (const result of relatedResults) {
    if (result.status === "rejected") {
      logger.warn(MODULE, `Related query failed: ${result.reason}`);
      continue;
    }

    const { filter, rows, joinKey, joinFieldApiName } = result.value;

    for (const row of rows) {
      const joinValue = row[joinFieldApiName!] as string;
      if (!joinValue) continue;

      const uniId = joinKey === "unifiedId" ? joinValue : sourceIdToUnifiedId.get(joinValue);
      if (!uniId) continue;

      const existing = relatedByUnifiedId.get(uniId) ?? {};
      existing[filter.containerObjectApiName] = [...(existing[filter.containerObjectApiName] ?? []), row];
      relatedByUnifiedId.set(uniId, existing);
    }
  }

  const individuals: Individual[] = baseRows.map((row) => {
    const uniId = row["__unified_id__"] as string;
    return {
      id: (row["ssot__Id__c"] as string) ?? null,
      unifiedId: uniId ?? null,
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
      relatedData: relatedByUnifiedId.get(uniId) ?? {},
    };
  });

  return { individuals, totalCount: baseResult.status.rowCount };
};

export { getIndividualsForSegment };

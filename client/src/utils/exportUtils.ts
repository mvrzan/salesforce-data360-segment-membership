import JSZip from "jszip";
import type { Individual } from "../types/individuals";

type IndividualCoreKey =
  | "unifiedId"
  | "id"
  | "firstName"
  | "lastName"
  | "personName"
  | "salutation"
  | "birthDate"
  | "titleName"
  | "currentEmployerName"
  | "primaryAccountId"
  | "dataSourceId"
  | "dataSourceObjectId"
  | "photoUrl";

const CORE_HEADERS: { key: IndividualCoreKey; label: string }[] = [
  { key: "unifiedId", label: "Unified ID" },
  { key: "id", label: "Source ID" },
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "personName", label: "Person Name" },
  { key: "salutation", label: "Salutation" },
  { key: "birthDate", label: "Birth Date" },
  { key: "titleName", label: "Title" },
  { key: "currentEmployerName", label: "Employer" },
  { key: "primaryAccountId", label: "Primary Account ID" },
  { key: "dataSourceId", label: "Data Source ID" },
  { key: "dataSourceObjectId", label: "Data Source Object ID" },
  { key: "photoUrl", label: "Photo URL" },
];

const escapeCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const buildCoresCsv = (individuals: Individual[]): string => {
  const header = CORE_HEADERS.map((h) => escapeCsvCell(h.label)).join(",");
  const rows = individuals.map((ind) =>
    CORE_HEADERS.map((h) => escapeCsvCell(ind[h.key])).join(","),
  );
  return [header, ...rows].join("\n");
};

const collectDmoFields = (individuals: Individual[], dmo: string): string[] => {
  const seen = new Set<string>();
  for (const ind of individuals) {
    for (const row of ind.relatedData?.[dmo] ?? []) {
      for (const field of Object.keys(row)) {
        if (field !== "__unified_id__") seen.add(field);
      }
    }
  }
  return Array.from(seen);
};

const buildRelatedCsv = (individuals: Individual[], dmo: string): string => {
  const fields = collectDmoFields(individuals, dmo);
  const header = ["Unified ID", "Source ID", ...fields].map(escapeCsvCell).join(",");

  const rows: string[] = [];
  for (const ind of individuals) {
    for (const row of ind.relatedData?.[dmo] ?? []) {
      const cells = [
        escapeCsvCell(ind.unifiedId),
        escapeCsvCell(ind.id),
        ...fields.map((f) => escapeCsvCell(row[f])),
      ];
      rows.push(cells.join(","));
    }
  }

  return [header, ...rows].join("\n");
};

const collectDmos = (individuals: Individual[]): string[] => {
  const seen = new Set<string>();
  for (const ind of individuals) {
    for (const dmo of Object.keys(ind.relatedData ?? {})) {
      if ((ind.relatedData[dmo]?.length ?? 0) > 0) seen.add(dmo);
    }
  }
  return Array.from(seen);
};

export const exportIndividualsToZip = async (individuals: Individual[], segmentApiName: string): Promise<void> => {
  const slug = segmentApiName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
  const dmos = collectDmos(individuals);

  const zip = new JSZip();

  zip.file(`${slug}-individuals.csv`, buildCoresCsv(individuals));

  for (const dmo of dmos) {
    const dmoSlug = dmo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    zip.file(`${slug}-${dmoSlug}.csv`, buildRelatedCsv(individuals, dmo));
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slug}-export.zip`;
  link.click();
  URL.revokeObjectURL(url);
};

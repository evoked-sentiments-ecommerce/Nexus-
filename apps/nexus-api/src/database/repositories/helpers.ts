const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object";

const normalizeJsonValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
};

export const toStringArray = (value: unknown): string[] => {
  const normalized = normalizeJsonValue(value);
  if (!Array.isArray(normalized)) return [];
  return normalized.filter((item): item is string => typeof item === "string");
};

export const toObjectArray = <T extends Record<string, unknown>>(value: unknown): T[] => {
  const normalized = normalizeJsonValue(value);
  if (!Array.isArray(normalized)) return [];
  return normalized.filter((item): item is T => isRecord(item));
};

export const toIsoString = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  return new Date().toISOString();
};

export const toNullableIsoString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  return toIsoString(value);
};

export const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const toNullableString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

export const toJson = (value: unknown): string => JSON.stringify(value ?? []);

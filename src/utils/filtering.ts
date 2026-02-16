const VERSION_PATTERN = /^(0|[1-9]\d*)(?:\.(0|[1-9]\d*)){0,2}$/;
const ISO_DATE_PREFIX_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:$|T| )/;
const ISO_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const normalizeNonEmptyString = (value?: string | null): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();
  if (lower === 'null' || lower === 'undefined') {
    return null;
  }

  return trimmed;
};

export const parseVersion = (value?: string | null): number[] | null => {
  const normalized = normalizeNonEmptyString(value);
  if (!normalized || !VERSION_PATTERN.test(normalized)) {
    return null;
  }

  const [major = '0', minor = '0', patch = '0'] = normalized.split('.');
  return [parseInt(major, 10), parseInt(minor, 10), parseInt(patch, 10)];
};

export const compareVersions = (a: number[], b: number[]): number => {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const left = a[i] ?? 0;
    const right = b[i] ?? 0;

    if (left > right) {
      return 1;
    }

    if (left < right) {
      return -1;
    }
  }

  return 0;
};

export const isWithinVersionRange = (currentVersion: string, from?: string | null, to?: string | null): boolean => {
  const current = parseVersion(currentVersion);
  const fromVersion = parseVersion(from);
  const toVersion = parseVersion(to);

  if (!current) {
    return true;
  }

  if (!fromVersion && !toVersion) {
    return true;
  }

  if (fromVersion && compareVersions(current, fromVersion) < 0) {
    return false;
  }

  if (toVersion && compareVersions(current, toVersion) > 0) {
    return false;
  }

  return true;
};

const isValidCalendarDate = (year: number, month: number, day: number): boolean => {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
};

export const parseDate = (value?: string | null): Date | null => {
  const normalized = normalizeNonEmptyString(value);
  if (!normalized) {
    return null;
  }

  const datePrefixMatch = normalized.match(ISO_DATE_PREFIX_PATTERN);
  if (!datePrefixMatch) {
    return null;
  }

  const yearPart = datePrefixMatch[1];
  const monthPart = datePrefixMatch[2];
  const dayPart = datePrefixMatch[3];
  if (!yearPart || !monthPart || !dayPart) {
    return null;
  }

  const year = parseInt(yearPart, 10);
  const month = parseInt(monthPart, 10);
  const day = parseInt(dayPart, 10);
  if (!isValidCalendarDate(year, month, day)) {
    return null;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

export const isWithinDateRange = (now: Date, from?: string | null, to?: string | null): boolean => {
  const normalizedFrom = normalizeNonEmptyString(from);
  const normalizedTo = normalizeNonEmptyString(to);
  const fromDate = parseDate(normalizedFrom);
  const toDate = parseDate(normalizedTo);

  if (!fromDate && !toDate) {
    return true;
  }

  const nowTime = now.getTime();
  if (fromDate && nowTime < fromDate.getTime()) {
    return false;
  }

  let toDateTime: number | null = null;
  if (toDate) {
    toDateTime = toDate.getTime();
    if (ISO_DATE_ONLY_PATTERN.test(normalizedTo ?? '')) {
      toDateTime += DAY_IN_MS - 1;
    }
  }

  if (toDateTime != null && nowTime > toDateTime) {
    return false;
  }

  return true;
};

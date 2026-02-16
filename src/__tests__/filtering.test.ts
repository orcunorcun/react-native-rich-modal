import {
  compareVersions,
  isWithinDateRange,
  isWithinVersionRange,
  normalizeNonEmptyString,
  parseDate,
  parseVersion,
} from '../utils/filtering';

describe('normalizeNonEmptyString', () => {
  it('trims valid strings', () => {
    expect(normalizeNonEmptyString('  hello  ')).toBe('hello');
  });

  it('returns null for empty or sentinel values', () => {
    expect(normalizeNonEmptyString('')).toBeNull();
    expect(normalizeNonEmptyString('   ')).toBeNull();
    expect(normalizeNonEmptyString('null')).toBeNull();
    expect(normalizeNonEmptyString('undefined')).toBeNull();
    expect(normalizeNonEmptyString(undefined)).toBeNull();
  });
});

describe('parseVersion / compareVersions', () => {
  it('parses one-to-three semver parts', () => {
    expect(parseVersion('1')).toEqual([1, 0, 0]);
    expect(parseVersion('1.2')).toEqual([1, 2, 0]);
    expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
  });

  it('rejects invalid versions', () => {
    expect(parseVersion('1.2.3.4')).toBeNull();
    expect(parseVersion('1.a.3')).toBeNull();
    expect(parseVersion('01.2.3')).toBeNull();
  });

  it('compares versions correctly', () => {
    expect(compareVersions([1, 2, 3], [1, 2, 3])).toBe(0);
    expect(compareVersions([1, 2, 4], [1, 2, 3])).toBe(1);
    expect(compareVersions([1, 1, 9], [1, 2, 0])).toBe(-1);
  });

  it('checks version ranges', () => {
    expect(isWithinVersionRange('1.2.0', '1.0.0', '2.0.0')).toBe(true);
    expect(isWithinVersionRange('0.9.9', '1.0.0', '2.0.0')).toBe(false);
    expect(isWithinVersionRange('2.1.0', '1.0.0', '2.0.0')).toBe(false);
    expect(isWithinVersionRange('invalid', '1.0.0', '2.0.0')).toBe(true);
  });
});

describe('parseDate / isWithinDateRange', () => {
  it('parses valid ISO strings', () => {
    expect(parseDate('2026-02-13T03:00:00.000+09:00')).not.toBeNull();
    expect(parseDate('2026-02-13')).not.toBeNull();
  });

  it('rejects non-ISO and invalid calendar dates', () => {
    expect(parseDate('not-a-date')).toBeNull();
    expect(parseDate('2026-02-30T03:00:00.000+09:00')).toBeNull();
  });

  it('checks date ranges', () => {
    const now = new Date('2026-02-13T00:00:00.000Z');

    expect(isWithinDateRange(now, '2026-02-01T00:00:00.000Z', '2026-02-28T23:59:59.999Z')).toBe(true);
    expect(isWithinDateRange(now, '2026-02-14T00:00:00.000Z', '2026-02-28T23:59:59.999Z')).toBe(false);
    expect(isWithinDateRange(now, '2026-01-01T00:00:00.000Z', '2026-02-12T23:59:59.999Z')).toBe(false);
    expect(isWithinDateRange(now, undefined, undefined)).toBe(true);
  });

  it('treats date-only showDateTo values as inclusive end-of-day', () => {
    const lateInDay = new Date('2026-02-13T23:59:59.000Z');
    const nextDay = new Date('2026-02-14T00:00:00.000Z');

    expect(isWithinDateRange(lateInDay, undefined, '2026-02-13')).toBe(true);
    expect(isWithinDateRange(nextDay, undefined, '2026-02-13')).toBe(false);
  });
});

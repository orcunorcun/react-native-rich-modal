import {
  DEFAULT_AUTO_PLAY_INTERVAL_MS,
  getNextCarouselIndex,
  normalizeAutoPlayInterval,
} from '../components/CustomCarousel/helpers';

describe('normalizeAutoPlayInterval', () => {
  it('uses fallback for invalid values', () => {
    expect(normalizeAutoPlayInterval(undefined)).toBe(DEFAULT_AUTO_PLAY_INTERVAL_MS);
    expect(normalizeAutoPlayInterval(Number.NaN)).toBe(DEFAULT_AUTO_PLAY_INTERVAL_MS);
    expect(normalizeAutoPlayInterval(0)).toBe(DEFAULT_AUTO_PLAY_INTERVAL_MS);
    expect(normalizeAutoPlayInterval(-100)).toBe(DEFAULT_AUTO_PLAY_INTERVAL_MS);
  });

  it('normalizes valid values', () => {
    expect(normalizeAutoPlayInterval(2500)).toBe(2500);
    expect(normalizeAutoPlayInterval(2500.9)).toBe(2500);
  });
});

describe('getNextCarouselIndex', () => {
  it('returns null when there is not enough data to move', () => {
    expect(getNextCarouselIndex({ currentIndex: 0, length: 0, loop: true })).toBeNull();
    expect(getNextCarouselIndex({ currentIndex: 0, length: 1, loop: true })).toBeNull();
  });

  it('returns next index when not at the end', () => {
    expect(getNextCarouselIndex({ currentIndex: 0, length: 3, loop: true })).toBe(1);
    expect(getNextCarouselIndex({ currentIndex: 1, length: 3, loop: false })).toBe(2);
  });

  it('loops to start when at the end and loop is enabled', () => {
    expect(getNextCarouselIndex({ currentIndex: 2, length: 3, loop: true })).toBe(0);
  });

  it('stops at the end when loop is disabled', () => {
    expect(getNextCarouselIndex({ currentIndex: 2, length: 3, loop: false })).toBeNull();
  });

  it('clamps invalid currentIndex values safely', () => {
    expect(getNextCarouselIndex({ currentIndex: -10, length: 3, loop: true })).toBe(1);
    expect(getNextCarouselIndex({ currentIndex: 100, length: 3, loop: true })).toBe(0);
    expect(getNextCarouselIndex({ currentIndex: Number.NaN, length: 3, loop: true })).toBe(1);
  });
});

import { resolveVisibilityTransition } from '../components/CustomModal/visibility';
import {
  shouldAllowBackButtonClose,
  shouldStartLocalNowRefresh,
  shouldUpdateImageAspectRatio,
} from '../richModal/behavior';

describe('resolveVisibilityTransition', () => {
  it('returns open when modal becomes visible for the first time', () => {
    expect(
      resolveVisibilityTransition({
        visible: true,
        wasVisible: false,
        isMounted: false,
        isClosing: false,
      }),
    ).toBe('open');
  });

  it('returns open when visibility turns back on during a closing phase', () => {
    expect(
      resolveVisibilityTransition({
        visible: true,
        wasVisible: true,
        isMounted: true,
        isClosing: true,
      }),
    ).toBe('open');
  });

  it('returns none while visible state stays stable', () => {
    expect(
      resolveVisibilityTransition({
        visible: true,
        wasVisible: true,
        isMounted: true,
        isClosing: false,
      }),
    ).toBe('none');
  });

  it('returns close only when a mounted visible modal is asked to hide', () => {
    expect(
      resolveVisibilityTransition({
        visible: false,
        wasVisible: true,
        isMounted: true,
        isClosing: false,
      }),
    ).toBe('close');
  });

  it('returns none for hide requests that are already settled', () => {
    expect(
      resolveVisibilityTransition({
        visible: false,
        wasVisible: false,
        isMounted: false,
        isClosing: false,
      }),
    ).toBe('none');

    expect(
      resolveVisibilityTransition({
        visible: false,
        wasVisible: true,
        isMounted: true,
        isClosing: true,
      }),
    ).toBe('none');
  });
});

describe('richModal behavior helpers', () => {
  it('starts local clock refresh only when server time is absent', () => {
    expect(shouldStartLocalNowRefresh(null)).toBe(true);
    expect(shouldStartLocalNowRefresh(new Date('2026-02-16T12:00:00.000Z'))).toBe(false);
  });

  it('updates aspect ratio on first measurement even if ratio is 1:1', () => {
    expect(
      shouldUpdateImageAspectRatio({
        currentRatio: undefined,
        nextRatio: 1,
      }),
    ).toBe(true);
  });

  it('skips aspect ratio update when ratio has not changed', () => {
    expect(
      shouldUpdateImageAspectRatio({
        currentRatio: 1.5,
        nextRatio: 1.5,
      }),
    ).toBe(false);
  });

  it('updates aspect ratio when value changes beyond epsilon', () => {
    expect(
      shouldUpdateImageAspectRatio({
        currentRatio: 1.5,
        nextRatio: 1.6,
      }),
    ).toBe(true);
  });

  it('disables Android back close only when both close button and backdrop close are disabled', () => {
    expect(shouldAllowBackButtonClose({ hideCloseButton: true, closeOnBackdropPress: false })).toBe(false);
    expect(shouldAllowBackButtonClose({ hideCloseButton: false, closeOnBackdropPress: false })).toBe(true);
    expect(shouldAllowBackButtonClose({ hideCloseButton: true, closeOnBackdropPress: true })).toBe(true);
  });
});

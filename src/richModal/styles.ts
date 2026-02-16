import { StyleSheet } from 'react-native';

import { FULLSCREEN_OVERLAY_INSET } from './helpers';
import Colors from '../assets/Colors';
import { CHECK_ROW_HEIGHT, CLOSE_BUTTON_SIZE, CONTENT_GAP, TEXT_SECTION_RADIUS } from '../constants';

export const styles = StyleSheet.create({
  modalContent: {
    alignSelf: 'center',
  },
  container: {
    alignItems: 'center',
  },
  containerFullscreen: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  closeButtonWrapper: {
    alignSelf: 'flex-end',
    marginBottom: CONTENT_GAP,
  },
  closeButtonWrapperFullscreen: {
    position: 'absolute',
    alignSelf: 'auto',
    marginBottom: 0,
    zIndex: 30,
  },
  closeButton: {
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
    borderRadius: CLOSE_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
    backgroundColor: 'transparent',
  },
  contentWrapper: {
    alignItems: 'center',
    gap: CONTENT_GAP,
    width: '100%',
  },
  contentWrapperFullscreen: {
    flex: 1,
    justifyContent: 'center',
    gap: 0,
  },
  image: {
    alignSelf: 'center',
  },
  carouselOuter: {
    alignItems: 'center',
    width: '100%',
  },
  carouselOuterFullscreen: {
    justifyContent: 'center',
    height: '100%',
  },
  carouselWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  carouselWrapperFullscreen: {
    height: '100%',
  },
  carouselViewport: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselViewportFullscreen: {
    height: '100%',
  },
  carouselDots: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'center',
    paddingVertical: 10,
  },
  carouselDotsFullscreen: {
    position: 'absolute',
    alignSelf: 'center',
    paddingVertical: 0,
    zIndex: 20,
  },
  carouselItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselItemTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  placeholderText: {
    color: Colors.red,
    fontSize: 14,
    textAlign: 'center',
  },
  placeholderPath: {
    color: Colors.white,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  textCard: {
    backgroundColor: Colors.white,
    borderRadius: TEXT_SECTION_RADIUS,
    padding: 12,
  },
  textCardFullscreen: {
    position: 'absolute',
    left: FULLSCREEN_OVERLAY_INSET,
    right: FULLSCREEN_OVERLAY_INSET,
    zIndex: 20,
  },
  textScroll: {
    flexGrow: 0,
  },
  textContent: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.midnightBlue,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: Colors.black,
    lineHeight: 18,
    textAlign: 'center',
  },
  checkRow: {
    height: CHECK_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.lightBlack,
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: CONTENT_GAP,
  },
  checkRowFullscreen: {
    position: 'absolute',
    alignSelf: 'center',
    marginTop: 0,
    zIndex: 20,
  },
  checkText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

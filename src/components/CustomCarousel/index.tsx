import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import CarouselDot from './CarouselDot';
import { getNextCarouselIndex, normalizeAutoPlayInterval } from './helpers';

import type { ReactNode } from 'react';
import type { SharedValue } from 'react-native-reanimated';

type CarouselRenderItemProps<T> = {
  item: T;
  index: number;
};

type ProgressHandler = ((offsetProgress: number, absoluteProgress: number) => void) | SharedValue<number>;

export type CustomCarouselProps<T> = {
  data: T[];
  width: number;
  height: number;
  renderItem: (props: CarouselRenderItemProps<T>) => ReactNode;
  onSnapToItem?: (index: number) => void;
  onScrollStateChange?: (isScrolling: boolean) => void;
  onProgressChange?: ProgressHandler;
  showDots?: boolean;
  activeDotColor?: string;
  inactiveDotColor?: string;
  dotSize?: number;
  activeDotWidth?: number;
  progressSharedValue?: SharedValue<number>;
  wrapperStyle?: StyleProp<ViewStyle>;
  carouselStyle?: StyleProp<ViewStyle>;
  dotContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  enabled?: boolean;
  pagingEnabled?: boolean;
  snapEnabled?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  testID?: string;
  getItemTestID?: (index: number) => string;
  getDotTestID?: (index: number) => string;
};

const CustomCarousel = <T,>({
  data,
  width,
  height,
  renderItem,
  onSnapToItem,
  onScrollStateChange,
  onProgressChange,
  showDots = true,
  activeDotColor,
  inactiveDotColor,
  dotSize,
  activeDotWidth,
  progressSharedValue,
  wrapperStyle,
  carouselStyle,
  dotContainerStyle,
  style,
  enabled,
  pagingEnabled = true,
  snapEnabled = true,
  loop = true,
  autoPlay = false,
  autoPlayInterval,
  testID,
  getItemTestID,
  getDotTestID,
}: CustomCarouselProps<T>) => {
  const flatListRef = useRef<FlatList<T> | null>(null);
  const activeIndexRef = useRef(0);
  const isUserDraggingRef = useRef(false);
  const internalProgress = useSharedValue<number>(0);
  const progress = progressSharedValue ?? internalProgress;

  const hasMultipleSlides = data.length > 1;
  const shouldEnable = (enabled ?? true) && hasMultipleSlides;
  const normalizedAutoPlayInterval = useMemo(() => normalizeAutoPlayInterval(autoPlayInterval), [autoPlayInterval]);

  const updateProgress = useCallback(
    (offsetX: number) => {
      const absoluteProgress = width > 0 ? offsetX / width : 0;
      progress.value = absoluteProgress;

      if (typeof onProgressChange === 'function') {
        onProgressChange(offsetX, absoluteProgress);
        return;
      }

      if (onProgressChange) {
        onProgressChange.value = absoluteProgress;
      }
    },
    [onProgressChange, progress, width],
  );

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      if (width <= 0) {
        return;
      }

      flatListRef.current?.scrollToOffset({
        offset: width * index,
        animated,
      });
    },
    [width],
  );

  useEffect(() => {
    const maxIndex = Math.max(data.length - 1, 0);
    const clampedIndex = Math.max(0, Math.min(activeIndexRef.current, maxIndex));
    activeIndexRef.current = clampedIndex;
    const offsetX = clampedIndex * width;
    const absoluteProgress = width > 0 ? offsetX / width : 0;
    progress.value = absoluteProgress;

    if (onProgressChange && typeof onProgressChange !== 'function') {
      onProgressChange.value = absoluteProgress;
    }
  }, [data.length, onProgressChange, progress, width]);

  useEffect(() => {
    if (!autoPlay || !shouldEnable || width <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      if (isUserDraggingRef.current) {
        return;
      }

      const nextIndex = getNextCarouselIndex({
        currentIndex: activeIndexRef.current,
        length: data.length,
        loop,
      });

      if (nextIndex === null) {
        return;
      }

      activeIndexRef.current = nextIndex;
      scrollToIndex(nextIndex, true);
    }, normalizedAutoPlayInterval);

    return () => {
      clearInterval(timerId);
    };
  }, [autoPlay, data.length, loop, normalizedAutoPlayInterval, scrollToIndex, shouldEnable, width]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      updateProgress(event.nativeEvent.contentOffset.x);
    },
    [updateProgress],
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      updateProgress(offsetX);
      onScrollStateChange?.(false);
      isUserDraggingRef.current = false;

      if (width <= 0 || data.length === 0) {
        return;
      }

      const snappedIndex = Math.round(offsetX / width);
      const clampedIndex = Math.max(0, Math.min(snappedIndex, data.length - 1));
      activeIndexRef.current = clampedIndex;
      onSnapToItem?.(clampedIndex);
    },
    [data.length, onScrollStateChange, onSnapToItem, updateProgress, width],
  );

  const handleScrollBeginDrag = useCallback(() => {
    isUserDraggingRef.current = true;
    onScrollStateChange?.(true);
  }, [onScrollStateChange]);

  const handleScrollEndDrag = useCallback(() => {
    onScrollStateChange?.(false);
  }, [onScrollStateChange]);

  const dots = useMemo(() => {
    if (!showDots || !hasMultipleSlides) {
      return null;
    }

    return (
      <View style={[styles.dots, dotContainerStyle]}>
        {data.map((_, index) => (
          <CarouselDot
            key={`carousel-dot-${index}`}
            index={index}
            progress={progress}
            length={data.length}
            activeColor={activeDotColor}
            inactiveColor={inactiveDotColor}
            size={dotSize}
            activeWidth={activeDotWidth}
            testID={getDotTestID?.(index)}
          />
        ))}
      </View>
    );
  }, [
    activeDotColor,
    activeDotWidth,
    data,
    dotContainerStyle,
    dotSize,
    hasMultipleSlides,
    inactiveDotColor,
    progress,
    showDots,
    getDotTestID,
  ]);

  const keyExtractor = useCallback((_: T, index: number) => `carousel-item-${index}`, []);
  const renderCarouselItem = useCallback<ListRenderItem<T>>(
    ({ item, index }) => (
      <View style={[styles.item, { width, height }]} testID={getItemTestID?.(index)}>
        {renderItem({ item, index })}
      </View>
    ),
    [getItemTestID, height, renderItem, width],
  );
  const getItemLayout = useCallback(
    (_: ArrayLike<T> | null | undefined, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  if (data.length === 0) {
    return null;
  }

  return (
    <View style={wrapperStyle} testID={testID}>
      <FlatList
        ref={flatListRef}
        horizontal
        data={data}
        bounces={false}
        scrollEnabled={shouldEnable}
        pagingEnabled={pagingEnabled}
        decelerationRate={snapEnabled ? 'fast' : 'normal'}
        showsHorizontalScrollIndicator={false}
        style={[styles.carousel, style, carouselStyle]}
        keyExtractor={keyExtractor}
        renderItem={renderCarouselItem}
        getItemLayout={getItemLayout}
        initialNumToRender={Math.min(1, data.length)}
        maxToRenderPerBatch={1}
        windowSize={3}
        removeClippedSubviews={true}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      />
      {dots}
    </View>
  );
};

const styles = StyleSheet.create({
  carousel: {
    alignSelf: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'center',
    paddingVertical: 10,
  },
});

const MemoizedCustomCarousel = memo(CustomCarousel) as typeof CustomCarousel;

export default MemoizedCustomCarousel;

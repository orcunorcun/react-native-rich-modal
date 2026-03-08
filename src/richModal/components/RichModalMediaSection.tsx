import { Fragment, memo, useCallback } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import CustomCarousel from '../../components/CustomCarousel';
import CarouselDot from '../../components/CustomCarousel/CarouselDot';
import CustomImage from '../../components/CustomImage';
import CustomTouchable from '../../components/CustomTouchable';
import CustomZoomableView from '../../components/CustomZoomableView';
import { buildIndexedTestID } from '../helpers';
import { styles } from '../styles';

import type { PopupItemType } from '../../types';
import type {
  RichModalImageResizeMode,
  RichModalImageSize,
  RichModalPopupImage,
  RichModalRenderCarouselDotProps,
  RichModalRenderImageProps,
  RichModalRenderPlaceholderProps,
  RichModalStyleOverrides,
} from '../types';
import type { ComponentProps, ComponentType, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

type ReanimatedViewProps = Omit<ComponentProps<typeof View>, 'style'> & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

type Props = {
  popup: PopupItemType;
  hasImage: boolean;
  contentWidth: number;
  maxImageHeight: number;
  isFullscreenImageMode: boolean;
  popupId: string | null;
  visibleImageItems: RichModalPopupImage[];
  imageCount: number;
  imageSizes: Record<string, RichModalImageSize>;
  labelsMissingImage: string;
  renderImageOverride?: (props: RichModalRenderImageProps) => ReactNode;
  renderPlaceholderOverride?: (props: RichModalRenderPlaceholderProps) => ReactNode;
  renderCarouselDotOverride?: (props: RichModalRenderCarouselDotProps) => ReactNode;
  resolvedImageResizeMode: RichModalImageResizeMode;
  popupPanZoomEnabled: boolean;
  isDoubleTapZoomEnabled: boolean;
  isCarouselDragging: boolean;
  popupMaxZoomScale: number;
  shouldUseItemLinkTouchable: boolean;
  useUserAgent: boolean;
  userAgent?: string;
  onOpenUrl: () => void;
  onImageError: (key: string) => void;
  onImageLoadDimensions: (key: string, width: number, height: number) => void;
  onSnapToItem: (index: number) => void;
  onScrollStateChange: (dragging: boolean) => void;
  carouselProgress: SharedValue<number>;
  carouselLoop: boolean;
  carouselAutoPlay: boolean;
  carouselAutoPlayInterval?: number;
  carouselDotActiveColor: string;
  carouselDotInactiveColor: string;
  placeholderBackgroundColor: string;
  placeholderTextColor: string;
  placeholderPathColor: string;
  styleOverrides?: RichModalStyleOverrides;
  animatedMaskStyle: StyleProp<ViewStyle>;
  fullscreenDotsBottom: number;
  carouselTestID: string;
  carouselItemTestIDPrefix: string;
  carouselDotTestIDPrefix: string;
  imageTestIDPrefix: string;
  placeholderTestIDPrefix: string;
};

const ReanimatedView = Animated.View as unknown as ComponentType<ReanimatedViewProps>;

const RichModalMediaSection = ({
  popup,
  hasImage,
  contentWidth,
  maxImageHeight,
  isFullscreenImageMode,
  popupId,
  visibleImageItems,
  imageCount,
  imageSizes,
  labelsMissingImage,
  renderImageOverride,
  renderPlaceholderOverride,
  renderCarouselDotOverride,
  resolvedImageResizeMode,
  popupPanZoomEnabled,
  isDoubleTapZoomEnabled,
  isCarouselDragging,
  popupMaxZoomScale,
  shouldUseItemLinkTouchable,
  useUserAgent,
  userAgent,
  onOpenUrl,
  onImageError,
  onImageLoadDimensions,
  onSnapToItem,
  onScrollStateChange,
  carouselProgress,
  carouselLoop,
  carouselAutoPlay,
  carouselAutoPlayInterval,
  carouselDotActiveColor,
  carouselDotInactiveColor,
  placeholderBackgroundColor,
  placeholderTextColor,
  placeholderPathColor,
  styleOverrides,
  animatedMaskStyle,
  fullscreenDotsBottom,
  carouselTestID,
  carouselItemTestIDPrefix,
  carouselDotTestIDPrefix,
  imageTestIDPrefix,
  placeholderTestIDPrefix,
}: Props) => {
  // Each carousel item can render a placeholder, a custom image renderer, or the default image node.
  const renderCarouselItem = useCallback(
    ({ item, index }: { item: RichModalPopupImage; index: number }) => {
      const itemSize = imageSizes[item.key] ?? {
        width: contentWidth,
        height: maxImageHeight,
      };
      const itemPlaceholderSize = Math.min(itemSize.width, itemSize.height);
      const imageTestID = buildIndexedTestID(imageTestIDPrefix, index);
      const placeholderTestID = buildIndexedTestID(placeholderTestIDPrefix, index);
      const carouselItemTestID = buildIndexedTestID(carouselItemTestIDPrefix, index);
      const handleItemError = () => onImageError(item.key);
      const handleItemDimensions = (width: number, height: number) => onImageLoadDimensions(item.key, width, height);

      let content: ReactNode;
      if (item.showPlaceholder) {
        if (renderPlaceholderOverride) {
          content = renderPlaceholderOverride({
            image: item,
            popup,
            label: labelsMissingImage,
            testID: placeholderTestID,
          });
        } else {
          content = (
            <View
              testID={placeholderTestID}
              style={[
                styles.placeholder,
                {
                  width: itemPlaceholderSize,
                  height: itemPlaceholderSize,
                  backgroundColor: placeholderBackgroundColor,
                },
                styleOverrides?.placeholder,
              ]}>
              <Text style={[styles.placeholderText, { color: placeholderTextColor }, styleOverrides?.placeholderText]}>
                {labelsMissingImage}
              </Text>
              {item.placeholderPath ? (
                <Text
                  style={[styles.placeholderPath, { color: placeholderPathColor }, styleOverrides?.placeholderPath]}>
                  {item.placeholderPath}
                </Text>
              ) : null}
            </View>
          );
        }
      } else if (renderImageOverride) {
        content = renderImageOverride({
          image: item,
          popup,
          size: itemSize,
          resizeMode: resolvedImageResizeMode,
          panZoomEnabled: popupPanZoomEnabled,
          doubleTapEnabled: isDoubleTapZoomEnabled,
          maxZoomScale: popupMaxZoomScale,
          onError: handleItemError,
          onLoadDimensions: handleItemDimensions,
          useUserAgent,
          userAgent,
          testID: imageTestID,
        });
      } else {
        const imageNode = (
          <CustomImage
            src={item.source}
            resizeMode={resolvedImageResizeMode}
            width={itemSize.width}
            height={itemSize.height}
            style={[styles.image, styleOverrides?.image]}
            useUserAgent={useUserAgent}
            userAgent={userAgent}
            handleError={handleItemError}
            onLoadDimensions={handleItemDimensions}
            testID={imageTestID}
          />
        );

        content = popupPanZoomEnabled ? (
          <CustomZoomableView
            enabled
            doubleTapEnabled={isDoubleTapZoomEnabled}
            disablePan={isCarouselDragging}
            maxScale={popupMaxZoomScale}
            width={contentWidth}
            height={maxImageHeight}
            contentWidth={itemSize.width}
            contentHeight={itemSize.height}>
            {imageNode}
          </CustomZoomableView>
        ) : (
          imageNode
        );
      }

      const finalContent = shouldUseItemLinkTouchable ? (
        <CustomTouchable
          onPress={onOpenUrl}
          style={styles.carouselItemTouchable}
          testID={`${carouselItemTestID}-touchable`}>
          {content}
        </CustomTouchable>
      ) : (
        content
      );

      return (
        <View
          style={[styles.carouselItem, { width: contentWidth, height: maxImageHeight }, styleOverrides?.carouselItem]}>
          {finalContent}
        </View>
      );
    },
    [
      contentWidth,
      imageSizes,
      isCarouselDragging,
      isDoubleTapZoomEnabled,
      labelsMissingImage,
      maxImageHeight,
      onImageError,
      onImageLoadDimensions,
      onOpenUrl,
      placeholderBackgroundColor,
      placeholderPathColor,
      placeholderTextColor,
      popup,
      popupMaxZoomScale,
      popupPanZoomEnabled,
      carouselItemTestIDPrefix,
      imageTestIDPrefix,
      placeholderTestIDPrefix,
      renderImageOverride,
      renderPlaceholderOverride,
      resolvedImageResizeMode,
      shouldUseItemLinkTouchable,
      styleOverrides?.carouselItem,
      styleOverrides?.image,
      styleOverrides?.placeholder,
      styleOverrides?.placeholderPath,
      styleOverrides?.placeholderText,
      useUserAgent,
      userAgent,
    ],
  );

  if (!hasImage) {
    return null;
  }

  return (
    <View
      style={[
        styles.carouselOuter,
        { width: contentWidth, height: isFullscreenImageMode ? maxImageHeight : undefined },
        isFullscreenImageMode ? styles.carouselOuterFullscreen : null,
        styleOverrides?.carouselOuter,
      ]}>
      <ReanimatedView
        style={[
          styles.carouselWrapper,
          { width: contentWidth },
          isFullscreenImageMode ? styles.carouselWrapperFullscreen : null,
          styleOverrides?.carouselWrapper,
          animatedMaskStyle,
        ]}>
        <CustomCarousel
          key={popupId ?? 'popup-carousel'}
          data={visibleImageItems}
          width={contentWidth}
          height={maxImageHeight}
          loop={carouselLoop}
          autoPlay={carouselAutoPlay}
          autoPlayInterval={carouselAutoPlayInterval}
          showDots={false}
          progressSharedValue={carouselProgress}
          onSnapToItem={onSnapToItem}
          onScrollStateChange={onScrollStateChange}
          testID={carouselTestID}
          getItemTestID={index => buildIndexedTestID(carouselItemTestIDPrefix, index)}
          wrapperStyle={[
            styles.carouselViewport,
            { width: contentWidth, height: maxImageHeight },
            isFullscreenImageMode ? styles.carouselViewportFullscreen : null,
            styleOverrides?.carouselViewport,
          ]}
          renderItem={renderCarouselItem}
        />
      </ReanimatedView>
      {imageCount > 1 ? (
        <View
          style={[
            styles.carouselDots,
            isFullscreenImageMode ? [styles.carouselDotsFullscreen, { bottom: fullscreenDotsBottom }] : null,
            styleOverrides?.carouselDots,
          ]}>
          {visibleImageItems.map((_, index) => (
            <Fragment key={`popup-carousel-dot-${index}`}>
              {renderCarouselDotOverride ? (
                renderCarouselDotOverride({
                  index,
                  length: imageCount,
                  progress: carouselProgress,
                  activeColor: carouselDotActiveColor,
                  inactiveColor: carouselDotInactiveColor,
                  testID: buildIndexedTestID(carouselDotTestIDPrefix, index),
                })
              ) : (
                <CarouselDot
                  index={index}
                  progress={carouselProgress}
                  length={imageCount}
                  activeColor={carouselDotActiveColor}
                  inactiveColor={carouselDotInactiveColor}
                  testID={buildIndexedTestID(carouselDotTestIDPrefix, index)}
                />
              )}
            </Fragment>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default memo(RichModalMediaSection);

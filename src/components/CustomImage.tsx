import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Platform, StyleSheet, Text, UIManager, View } from 'react-native';

import type { ImageProps, ImageStyle as RNImageStyle, StyleProp, ViewStyle } from 'react-native';

type CustomImageProps = {
  src?: string | number | null;
  width?: number;
  height?: number;
  style?: StyleProp<RNImageStyle>;
  resizeMode?: ImageProps['resizeMode'];
  handleError?: () => void;
  onLoadDimensions?: (width: number, height: number) => void;
  cache?: boolean;
  useUserAgent?: boolean;
  userAgent?: string;
  testID?: string;
};

let FastImageComponent: any = null;
let FastImageResizeMode: any = null;
let isFastImageNativeAvailable = false;

try {
  const mod = require('react-native-fast-image');
  FastImageComponent = mod.default ?? mod;
  FastImageResizeMode = mod.ResizeMode ?? mod?.default?.ResizeMode;
  // Expo Go and some bare builds may have the JS package but not the native view manager.
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    isFastImageNativeAvailable = Boolean(UIManager.getViewManagerConfig?.('FastImageView'));
  } else {
    isFastImageNativeAvailable = false;
  }
} catch {
  FastImageComponent = null;
  FastImageResizeMode = null;
  isFastImageNativeAvailable = false;
}

const resolveFastImageResizeMode = (resizeMode?: ImageProps['resizeMode']) => {
  if (!FastImageResizeMode || !resizeMode) {
    return resizeMode;
  }
  return FastImageResizeMode[resizeMode] ?? resizeMode;
};

const CustomImage = ({
  src: srcProp,
  width: widthProp = 0,
  height: heightProp = 0,
  style: styleProp,
  resizeMode: resizeModeProp = 'contain',
  handleError: handleErrorProp,
  onLoadDimensions: onLoadDimensionsProp,
  cache = true,
  useUserAgent = false,
  userAgent,
  testID,
}: CustomImageProps) => {
  const imageSrc = useMemo(() => {
    if (!srcProp) {
      return null;
    }
    if (typeof srcProp === 'string') {
      const source: { uri: string; headers?: { [key: string]: string } } = {
        uri: srcProp,
      };
      if (useUserAgent && userAgent) {
        source.headers = { 'User-Agent': userAgent };
      }
      return source;
    }
    return srcProp;
  }, [srcProp, useUserAgent, userAgent]);

  const [isLoadErr, setIsLoadErr] = useState(false);

  useEffect(() => {
    setIsLoadErr(false);
  }, [srcProp]);

  const shouldShowPlaceholder = isLoadErr || !imageSrc;

  const [imageDimensionsState, setImageDimensionsState] = useState({
    width: widthProp,
    height: heightProp,
  });
  const hasFixedDimensions = widthProp > 0 && heightProp > 0;
  const resolvedDimensions = hasFixedDimensions
    ? {
        width: widthProp,
        height: heightProp,
      }
    : imageDimensionsState;

  useEffect(() => {
    if (hasFixedDimensions) {
      setImageDimensionsState(prev => {
        if (prev.width === widthProp && prev.height === heightProp) {
          return prev;
        }
        return { width: widthProp, height: heightProp };
      });
    }
  }, [hasFixedDimensions, heightProp, widthProp]);

  const setImageDimensionsIfChanged = useCallback((nextWidth: number, nextHeight: number) => {
    setImageDimensionsState(prev => {
      if (prev.width === nextWidth && prev.height === nextHeight) {
        return prev;
      }
      return { width: nextWidth, height: nextHeight };
    });
  }, []);

  const handleSetDimensions = useCallback(
    (originalWidth: number, originalHeight: number) => {
      const aspectRatio = originalWidth / originalHeight;

      if (widthProp > 0 && heightProp > 0) {
        setImageDimensionsIfChanged(widthProp, heightProp);
      } else if (heightProp > 0 && widthProp <= 0) {
        setImageDimensionsIfChanged(heightProp * aspectRatio, heightProp);
      } else if (widthProp > 0 && heightProp <= 0) {
        setImageDimensionsIfChanged(widthProp, widthProp / aspectRatio);
      } else {
        setImageDimensionsIfChanged(50, 50);
      }
    },
    [heightProp, setImageDimensionsIfChanged, widthProp],
  );

  const handleImageLoad = useCallback(
    (event: any) => {
      const originalWidth = event.nativeEvent?.source?.width;
      const originalHeight = event.nativeEvent?.source?.height;
      if (typeof originalWidth === 'number' && typeof originalHeight === 'number') {
        handleSetDimensions(originalWidth, originalHeight);
        onLoadDimensionsProp?.(originalWidth, originalHeight);
      }
    },
    [handleSetDimensions, onLoadDimensionsProp],
  );

  const handleFastImageLoad = useCallback(
    (event: any) => {
      const nativeEvent = event?.nativeEvent;
      const originalWidth = nativeEvent?.width ?? nativeEvent?.source?.width;
      const originalHeight = nativeEvent?.height ?? nativeEvent?.source?.height;
      if (typeof originalWidth === 'number' && typeof originalHeight === 'number') {
        handleSetDimensions(originalWidth, originalHeight);
        onLoadDimensionsProp?.(originalWidth, originalHeight);
      }
    },
    [handleSetDimensions, onLoadDimensionsProp],
  );

  const handleError = useCallback(() => {
    setIsLoadErr(true);
    handleErrorProp?.();
  }, [handleErrorProp]);

  const placeholderSizeStyle = useMemo<ViewStyle>(
    () => ({
      width: resolvedDimensions.width > 0 ? resolvedDimensions.width : 50,
      height: resolvedDimensions.height > 0 ? resolvedDimensions.height : 50,
    }),
    [resolvedDimensions.height, resolvedDimensions.width],
  );

  if (shouldShowPlaceholder) {
    return (
      <View testID={testID} style={[styles.placeholder, styleProp as StyleProp<ViewStyle>, placeholderSizeStyle]}>
        <Text style={styles.placeholderText}>No image found</Text>
      </View>
    );
  }

  if (!cache || !FastImageComponent || !isFastImageNativeAvailable) {
    return (
      <Image
        source={imageSrc}
        style={[
          styleProp,
          {
            width: resolvedDimensions.width,
            height: resolvedDimensions.height,
          },
        ]}
        resizeMode={resizeModeProp}
        onLoad={handleImageLoad}
        onError={handleError}
        testID={testID}
      />
    );
  }

  return (
    <FastImageComponent
      source={imageSrc}
      style={[
        styleProp,
        {
          width: resolvedDimensions.width,
          height: resolvedDimensions.height,
        },
      ]}
      resizeMode={resolveFastImageResizeMode(resizeModeProp)}
      onLoad={handleFastImageLoad}
      onError={handleError}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  placeholderText: {
    color: '#FF3D3D',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CustomImage;

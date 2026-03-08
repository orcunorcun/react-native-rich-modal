import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Vibration } from 'react-native';

import type { ReactNode } from 'react';
import type { Insets, StyleProp, ViewStyle } from 'react-native';

const VIBRATE_DURATION = 10;

interface CustomTouchablePropsType {
  onPress?: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  vibrate?: boolean;
  onPressIn?: () => void;
  scalable?: boolean;
  onPressOut?: () => void;
  children: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  touchFeedback?: boolean;
  underlayColor?: string;
  hitSlop?: Insets | number;
}

const CustomTouchable = ({
  onPress,
  onLongPress,
  delayLongPress,
  vibrate = false,
  onPressIn,
  scalable = false,
  onPressOut,
  children,
  disabled = false,
  style,
  touchFeedback = false,
  underlayColor = 'rgba(0,0,0,0.1)',
  hitSlop,
}: CustomTouchablePropsType) => {
  // create ref
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressSequenceRef = useRef(0);
  const longPressTriggeredPressIdRef = useRef<number | null>(null);

  // local state
  const [pressed, setPressed] = useState(false);

  const handlePressIn = () => {
    if (disabled) return;
    // New press sequence; clear any previous long-press marker
    pressSequenceRef.current += 1;
    longPressTriggeredPressIdRef.current = null;
    if (vibrate) {
      Vibration.vibrate(VIBRATE_DURATION);
    }
    // run user callback
    onPressIn?.();
    // apply underlayColor if needed
    if (touchFeedback) {
      setPressed(true);
    }
    // animate scale down
    if (scalable) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    // run user callback
    onPressOut?.();
    // remove underlayColor
    if (touchFeedback) {
      setPressed(false);
    }
    // animate scale back
    if (scalable) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (disabled) return;
    if (longPressTriggeredPressIdRef.current === pressSequenceRef.current) {
      longPressTriggeredPressIdRef.current = null;
      return;
    }
    onPress?.();
  };

  const handleLongPress = () => {
    if (disabled) return;
    longPressTriggeredPressIdRef.current = pressSequenceRef.current;
    onLongPress?.();
  };

  const hasLongPressHandler = typeof onLongPress === 'function';

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={hasLongPressHandler ? handleLongPress : undefined}
      delayLongPress={hasLongPressHandler ? delayLongPress : undefined}
      disabled={disabled}
      hitSlop={hitSlop}>
      <Animated.View
        style={[
          styles.container,
          style,
          { transform: [{ scale: scaleAnim }] },
          touchFeedback && pressed ? { backgroundColor: underlayColor } : undefined, // underlay color feedback
        ]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    // Ensure contents are clipped if underlayColor applied
    overflow: 'hidden',
  },
});

export default CustomTouchable;

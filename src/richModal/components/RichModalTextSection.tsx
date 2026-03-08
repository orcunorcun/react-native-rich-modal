import { memo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { styles } from '../styles';

import type { RichModalStyleOverrides } from '../types';

type Props = {
  hasText: boolean;
  isFullscreenImageMode: boolean;
  maxTextHeight: number;
  titleText: string | null;
  messageText: string | null;
  resolvedTextCardBackgroundColor: string;
  resolvedTitleColor: string;
  resolvedMessageColor: string;
  styleOverrides?: RichModalStyleOverrides;
  fullscreenTextBottom: number;
  titleTestID: string;
  messageTestID: string;
};

const RichModalTextSection = ({
  hasText,
  isFullscreenImageMode,
  maxTextHeight,
  titleText,
  messageText,
  resolvedTextCardBackgroundColor,
  resolvedTitleColor,
  resolvedMessageColor,
  styleOverrides,
  fullscreenTextBottom,
  titleTestID,
  messageTestID,
}: Props) => {
  if (!hasText) {
    return null;
  }

  return (
    <View
      style={[
        styles.textCard,
        { backgroundColor: resolvedTextCardBackgroundColor },
        isFullscreenImageMode ? [styles.textCardFullscreen, { bottom: fullscreenTextBottom }] : null,
        styleOverrides?.textCard,
      ]}>
      <ScrollView
        style={[styles.textScroll, { maxHeight: maxTextHeight }, styleOverrides?.textScroll]}
        contentContainerStyle={[styles.textContent, styleOverrides?.textContent]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled">
        {titleText ? (
          <Text
            testID={titleTestID}
            style={[styles.title, { color: resolvedTitleColor }, styleOverrides?.title]}
            numberOfLines={3}>
            {titleText}
          </Text>
        ) : null}
        {messageText ? (
          <Text
            testID={messageTestID}
            style={[styles.message, { color: resolvedMessageColor }, styleOverrides?.message]}>
            {messageText}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default memo(RichModalTextSection);

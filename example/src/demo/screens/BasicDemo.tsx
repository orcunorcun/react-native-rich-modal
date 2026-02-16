import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { RichModal } from 'react-native-rich-modal';

import DemoActionButton from '../components/DemoActionButton';
import { DemoCard } from '../components/DemoCard';
import { resolveImage } from '../data/images';
import { BASIC_POPUPS } from '../data/popups';
import { useModalReplay } from '../hooks/useModalReplay';
import { styles } from '../styles';

import type { DemoScreenProps } from '../types';

export const BasicDemo = ({ insets }: DemoScreenProps) => {
  const { modalKey, replay, visible } = useModalReplay('basic');
  const [hideImage, setHideImage] = useState(false);
  const [hideTitle, setHideTitle] = useState(false);
  const [hideMessage, setHideMessage] = useState(false);
  const [closeOnBackdropPress, setCloseOnBackdropPress] = useState(true);
  const [hideCloseButton, setHideCloseButton] = useState(false);

  const actions = useMemo(() => <DemoActionButton title="Play popup" onPress={replay} />, [replay]);

  return (
    <DemoCard
      title="Basic usage"
      description="Pass only popups + image resolver. This is the default starter example."
      actions={actions}>
      <View style={styles.modeSelectorRow}>
        <Pressable
          onPress={() => setHideImage(prev => !prev)}
          style={[styles.modeSelectorButton, hideImage ? styles.modeSelectorButtonActive : null]}>
          <Text style={[styles.modeSelectorButtonText, hideImage ? styles.modeSelectorButtonTextActive : null]}>
            hide image
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setHideTitle(prev => !prev)}
          style={[styles.modeSelectorButton, hideTitle ? styles.modeSelectorButtonActive : null]}>
          <Text style={[styles.modeSelectorButtonText, hideTitle ? styles.modeSelectorButtonTextActive : null]}>
            hide title
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setHideMessage(prev => !prev)}
          style={[styles.modeSelectorButton, hideMessage ? styles.modeSelectorButtonActive : null]}>
          <Text style={[styles.modeSelectorButtonText, hideMessage ? styles.modeSelectorButtonTextActive : null]}>
            hide message
          </Text>
        </Pressable>
      </View>
      <View style={styles.modeSelectorRow}>
        <Pressable
          onPress={() => setCloseOnBackdropPress(prev => !prev)}
          style={[styles.modeSelectorButton, closeOnBackdropPress ? styles.modeSelectorButtonActive : null]}>
          <Text
            style={[styles.modeSelectorButtonText, closeOnBackdropPress ? styles.modeSelectorButtonTextActive : null]}>
            backdrop close
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setHideCloseButton(prev => !prev)}
          style={[styles.modeSelectorButton, hideCloseButton ? styles.modeSelectorButtonActive : null]}>
          <Text style={[styles.modeSelectorButtonText, hideCloseButton ? styles.modeSelectorButtonTextActive : null]}>
            hide close btn
          </Text>
        </Pressable>
      </View>
      <RichModal
        key={modalKey}
        popups={BASIC_POPUPS}
        visible={visible}
        langCode="en"
        resolveImage={resolveImage}
        safeAreaInsets={insets}
        hideImage={hideImage}
        hideTitle={hideTitle}
        hideMessage={hideMessage}
        closeOnBackdropPress={closeOnBackdropPress}
        hideCloseButton={hideCloseButton}
      />
    </DemoCard>
  );
};

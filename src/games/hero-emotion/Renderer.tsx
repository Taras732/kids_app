import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';
import type { EmotionId } from '../emotions-recognize/Renderer';

export type HeroEmotionAnswer = EmotionId;

export interface HeroEmotionPayload {
  target: EmotionId;
  sceneEmoji: string;
  situationKey: string;
  candidates: EmotionId[];
}

const EMOTION_EMOJI: Record<EmotionId, string> = {
  happy: '😀',
  sad: '😢',
  angry: '😠',
  scared: '😨',
  surprised: '😲',
  sleepy: '😴',
};

export function Renderer({ task, onAnswer, disabled }: RendererProps<HeroEmotionAnswer>) {
  const payload = task.payload as HeroEmotionPayload;
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [task.id]);

  const handlePress = (value: EmotionId) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const isDisabled = disabled || locked;

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <AppText style={styles.sceneEmoji}>{payload.sceneEmoji}</AppText>
        <AppText style={styles.situation}>
          {t(`game.heroEmotion.situations.${payload.situationKey}`)}
        </AppText>
      </View>

      <View style={styles.buttonsRow}>
        {payload.candidates.map((id) => (
          <EmotionButton
            key={id}
            id={id}
            emoji={EMOTION_EMOJI[id]}
            onPress={() => handlePress(id)}
            disabled={isDisabled}
          />
        ))}
      </View>
    </View>
  );
}

interface EmotionButtonProps {
  id: EmotionId;
  emoji: string;
  onPress: () => void;
  disabled: boolean;
}

function EmotionButton({ id, emoji, onPress, disabled }: EmotionButtonProps) {
  const label = t(`game.emotions.names.${id}`);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
    >
      <AppText style={styles.buttonEmoji}>{emoji}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 220,
  },
  sceneEmoji: {
    fontSize: 88,
    lineHeight: 100,
  },
  situation: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fontFamily.bold,
    color: colors.text,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  button: {
    flex: 1,
    minHeight: 100,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  buttonEmoji: {
    fontSize: 48,
    lineHeight: 56,
  },
});

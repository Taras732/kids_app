import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type StageId = 'seed' | 'sprout' | 'leafy' | 'bloom' | 'fruit';
export type PlantGrowAnswer = StageId;

export interface PlantGrowPayload {
  current: StageId;
  currentEmoji: string;
  target: StageId;
  candidates: { id: StageId; emoji: string }[];
}

export function Renderer({ task, onAnswer, disabled }: RendererProps<PlantGrowAnswer>) {
  const payload = task.payload as PlantGrowPayload;
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [task.id]);

  const handlePress = (value: StageId) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const isDisabled = disabled || locked;

  return (
    <View style={styles.wrap}>
      <View style={styles.emojiCard}>
        <AppText style={styles.emoji}>{payload.currentEmoji}</AppText>
        <AppText style={styles.prompt}>{t('game.plantGrow.prompt')}</AppText>
      </View>

      <View style={styles.buttonsRow}>
        {payload.candidates.map((c) => (
          <StageButton
            key={c.id}
            id={c.id}
            emoji={c.emoji}
            onPress={() => handlePress(c.id)}
            disabled={isDisabled}
          />
        ))}
      </View>
    </View>
  );
}

interface StageButtonProps {
  id: StageId;
  emoji: string;
  onPress: () => void;
  disabled: boolean;
}

function StageButton({ id, emoji, onPress, disabled }: StageButtonProps) {
  const label = t(`game.plantGrow.stages.${id}`);
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
  emojiCard: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 200,
  },
  emoji: {
    fontSize: 104,
    lineHeight: 120,
  },
  prompt: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  button: {
    flex: 1,
    minHeight: 110,
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
    fontSize: 56,
    lineHeight: 68,
  },
});

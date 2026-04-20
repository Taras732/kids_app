import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type SinkFloatId = 'sink' | 'float';
export type SinkFloatAnswer = SinkFloatId;

export interface SinkFloatPayload {
  target: SinkFloatId;
  emoji: string;
  itemKey: string;
}

const OPTIONS: { id: SinkFloatId; icon: string }[] = [
  { id: 'float', icon: '☁️' },
  { id: 'sink', icon: '⬇️' },
];

export function Renderer({ task, onAnswer, disabled }: RendererProps<SinkFloatAnswer>) {
  const payload = task.payload as SinkFloatPayload;
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [task.id]);

  const handlePress = (value: SinkFloatId) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const isDisabled = disabled || locked;

  return (
    <View style={styles.wrap}>
      <View style={styles.emojiCard}>
        <AppText style={styles.emoji}>{payload.emoji}</AppText>
        <AppText style={styles.prompt}>{t('game.sinkFloat.prompt')}</AppText>
      </View>

      <View style={styles.buttonsRow}>
        {OPTIONS.map((o) => (
          <OptionButton
            key={o.id}
            id={o.id}
            icon={o.icon}
            onPress={() => handlePress(o.id)}
            disabled={isDisabled}
          />
        ))}
      </View>
    </View>
  );
}

interface OptionButtonProps {
  id: SinkFloatId;
  icon: string;
  onPress: () => void;
  disabled: boolean;
}

function OptionButton({ id, icon, onPress, disabled }: OptionButtonProps) {
  const label = t(`game.sinkFloat.options.${id}`);
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
      <AppText style={styles.buttonIcon}>{icon}</AppText>
      <AppText style={styles.buttonText} color={disabled ? colors.textDisabled : colors.text}>
        {label}
      </AppText>
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
    minHeight: 220,
  },
  emoji: {
    fontSize: 120,
    lineHeight: 136,
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
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  button: {
    flex: 1,
    minHeight: 130,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  buttonIcon: {
    fontSize: 44,
    lineHeight: 52,
  },
  buttonText: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: fontFamily.extraBold,
    textAlign: 'center',
  },
});

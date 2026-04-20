import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type SafetyId = 'safe' | 'unsafe';
export type SafetyAnswer = SafetyId;

export interface SafetyPayload {
  target: SafetyId;
  emoji: string;
  itemKey: string;
}

const OPTIONS: { id: SafetyId; icon: string }[] = [
  { id: 'safe', icon: '✓' },
  { id: 'unsafe', icon: '✗' },
];

export function Renderer({ task, onAnswer, disabled }: RendererProps<SafetyAnswer>) {
  const payload = task.payload as SafetyPayload;
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [task.id]);

  const handlePress = (value: SafetyId) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const isDisabled = disabled || locked;

  return (
    <View style={styles.wrap}>
      <View style={styles.emojiCard}>
        <AppText style={styles.emoji}>{payload.emoji}</AppText>
        <AppText style={styles.prompt}>{t('game.safety.prompt')}</AppText>
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
  id: SafetyId;
  icon: string;
  onPress: () => void;
  disabled: boolean;
}

function OptionButton({ id, icon, onPress, disabled }: OptionButtonProps) {
  const label = t(`game.safety.options.${id}`);
  const isSafe = id === 'safe';
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isSafe ? styles.buttonSafe : styles.buttonUnsafe,
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
  buttonSafe: {
    borderColor: colors.success,
  },
  buttonUnsafe: {
    borderColor: colors.danger,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.primaryLight,
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

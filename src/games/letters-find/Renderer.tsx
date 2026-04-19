import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type LetterAnswer = string;

export interface LetterPayload {
  target: string;
  candidates: string[];
}

export function Renderer({ task, onAnswer, disabled }: RendererProps<LetterAnswer>) {
  const payload = task.payload as LetterPayload;
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [task.id]);

  const handlePress = (value: string) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const isDisabled = disabled || locked;
  const prompt = t('game.letters.prompt', { letter: payload.target });
  const [row1, row2] = [payload.candidates.slice(0, 2), payload.candidates.slice(2, 4)];

  return (
    <View style={styles.wrap}>
      <View style={styles.promptBox}>
        <AppText style={styles.prompt}>{prompt}</AppText>
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          {row1.map((letter, idx) => (
            <LetterTapZone
              key={`r1-${idx}`}
              letter={letter}
              onPress={() => handlePress(letter)}
              disabled={isDisabled}
            />
          ))}
        </View>
        <View style={styles.row}>
          {row2.map((letter, idx) => (
            <LetterTapZone
              key={`r2-${idx}`}
              letter={letter}
              onPress={() => handlePress(letter)}
              disabled={isDisabled}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

interface LetterTapZoneProps {
  letter: string;
  onPress: () => void;
  disabled: boolean;
}

function LetterTapZone({ letter, onPress, disabled }: LetterTapZoneProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.tapZone,
        disabled && styles.tapZoneDisabled,
        pressed && !disabled && styles.tapZonePressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={letter}
      hitSlop={4}
    >
      <AppText style={styles.letter} color={disabled ? colors.textDisabled : colors.text}>
        {letter}
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
  promptBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  prompt: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  grid: {
    flex: 1,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    flex: 1,
  },
  tapZone: {
    flex: 1,
    minHeight: 140,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapZoneDisabled: {
    opacity: 0.5,
  },
  tapZonePressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  letter: {
    fontSize: 72,
    lineHeight: 84,
    fontFamily: fontFamily.extraBold,
  },
});

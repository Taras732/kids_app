import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type WordAnswer = string;

export interface WordPicturePayload {
  picture: string;
  word: string;
  options: string[];
}

export function Renderer({ task, onAnswer, disabled }: RendererProps<WordAnswer>) {
  const payload = task.payload as WordPicturePayload;
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [task.id]);

  const handlePress = (value: string) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const isDisabled = !!disabled || locked;

  return (
    <View style={styles.wrap}>
      <View style={styles.pictureCard}>
        <AppText style={styles.emoji}>{payload.picture}</AppText>
        <AppText style={styles.prompt}>{t('game.englishWord.prompt')}</AppText>
      </View>

      <View style={styles.buttonsCol}>
        {payload.options.map((word, i) => (
          <Pressable
            key={`opt-${i}`}
            style={({ pressed }) => [
              styles.button,
              isDisabled && styles.buttonDisabled,
              pressed && !isDisabled && styles.buttonPressed,
            ]}
            onPress={() => handlePress(word)}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={word}
            hitSlop={4}
          >
            <AppText style={styles.buttonText} color={isDisabled ? colors.textDisabled : colors.text}>
              {word}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  pictureCard: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 180,
  },
  emoji: { fontSize: 104, lineHeight: 120 },
  prompt: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textAlign: 'center',
  },
  buttonsCol: {
    flex: 1,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  button: {
    minHeight: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: fontFamily.extraBold,
  },
});

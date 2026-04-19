import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type PatternAnswer = string;

export interface PatternPayload {
  sequence: string[];
  target: string;
  options: string[];
}

export function Renderer({ task, onAnswer, disabled }: RendererProps<PatternAnswer>) {
  const payload = task.payload as PatternPayload;
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
      <View style={styles.promptBox}>
        <AppText style={styles.prompt}>{t('game.patternNext.prompt')}</AppText>
      </View>

      <View style={styles.sequence}>
        {payload.sequence.map((item, i) => (
          <View key={`seq-${i}`} style={styles.seqTile}>
            <AppText style={styles.seqEmoji}>{item}</AppText>
          </View>
        ))}
        <View style={styles.questionTile}>
          <AppText style={styles.questionMark}>?</AppText>
        </View>
      </View>

      <View style={styles.options}>
        {payload.options.map((opt, i) => (
          <Pressable
            key={`opt-${i}`}
            style={({ pressed }) => [
              styles.optionBtn,
              isDisabled && styles.optionDisabled,
              pressed && !isDisabled && styles.optionPressed,
            ]}
            onPress={() => handlePress(opt)}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={opt}
            hitSlop={4}
          >
            <AppText style={styles.optionEmoji}>{opt}</AppText>
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
    gap: spacing.lg,
  },
  promptBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  prompt: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  sequence: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  seqTile: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionTile: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seqEmoji: { fontSize: 40, lineHeight: 48 },
  questionMark: {
    fontSize: 36,
    lineHeight: 44,
    fontFamily: fontFamily.extraBold,
    color: colors.primary,
  },
  options: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  optionBtn: {
    flex: 1,
    maxWidth: 120,
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionDisabled: { opacity: 0.5 },
  optionPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  optionEmoji: { fontSize: 52, lineHeight: 60 },
});

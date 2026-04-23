import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily, shadows } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export interface NumberPatternsPayload {
  visible: number[];
  correct: number;
  choices: number[];
}

export type NumberPatternsAnswer = number;

export function Renderer({ task, onAnswer, disabled }: RendererProps<NumberPatternsAnswer>) {
  const payload = task.payload as NumberPatternsPayload;
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [task.id]);

  const handlePress = (value: number) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const isDisabled = disabled || locked;
  const maxLen = Math.max(
    payload.choices.reduce((m, n) => Math.max(m, String(n).length), 0),
    payload.visible.reduce((m, n) => Math.max(m, String(n).length), 1),
  );
  const sequenceFontSize = maxLen <= 2 ? 48 : maxLen <= 3 ? 38 : 30;
  const choiceFontSize = maxLen <= 2 ? 40 : maxLen <= 3 ? 32 : 26;

  return (
    <View style={styles.wrap}>
      <AppText style={styles.prompt}>{t('game.numberPatterns.prompt')}</AppText>

      <View style={styles.sequenceBox}>
        {payload.visible.map((n, idx) => (
          <View key={idx} style={styles.numCell}>
            <AppText style={[styles.numText, { fontSize: sequenceFontSize, lineHeight: sequenceFontSize + 10 }]}>
              {n}
            </AppText>
          </View>
        ))}
        <View style={[styles.numCell, styles.numCellMissing]}>
          <AppText style={[styles.numText, { fontSize: sequenceFontSize, lineHeight: sequenceFontSize + 10, color: colors.primary }]}>
            ?
          </AppText>
        </View>
      </View>

      <View style={styles.choicesGrid}>
        {payload.choices.map((n) => (
          <Pressable
            key={n}
            style={[styles.choice, isDisabled && styles.choiceDisabled]}
            onPress={() => handlePress(n)}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={String(n)}
            hitSlop={4}
          >
            <AppText style={[styles.choiceText, { fontSize: choiceFontSize, lineHeight: choiceFontSize + 10 }]}>
              {n}
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
    padding: spacing.md,
    gap: spacing.md,
  },
  prompt: {
    fontSize: 20,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  sequenceBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    ...shadows.card,
  },
  numCell: {
    minWidth: 56,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numCellMissing: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  numText: {
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  choicesGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  choice: {
    width: '46%',
    minHeight: 96,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  choiceDisabled: {
    opacity: 0.5,
  },
  choiceText: {
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
});

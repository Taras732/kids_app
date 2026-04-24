import { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily, shadows } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type MeasuresMode = 'unit' | 'convert' | 'compare';

export interface MeasuresUnitTask {
  mode: 'unit';
  emoji: string;
  name: string;
  value: number;
  choices: string[];
  correct: string;
}

export interface MeasuresConvertTask {
  mode: 'convert';
  fromValue: number;
  fromLabel: string;
  toLabel: string;
  choices: number[];
  correct: number;
}

export interface MeasuresCompareTask {
  mode: 'compare';
  leftValue: number;
  leftLabel: string;
  rightValue: number;
  rightLabel: string;
  choices: string[];
  correct: string;
}

export type MeasuresPayload = MeasuresUnitTask | MeasuresConvertTask | MeasuresCompareTask;

export type MeasuresAnswer = string;

export function Renderer({ task, onAnswer, disabled }: RendererProps<MeasuresAnswer>) {
  const payload = task.payload as MeasuresPayload;
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [task.id]);

  const submit = (value: string) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const isDisabled = disabled || locked;

  if (payload.mode === 'unit') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText style={styles.prompt}>{t('game.measures.unitPrompt')}</AppText>
        <View style={styles.objectCard}>
          <AppText style={styles.objectEmoji}>{payload.emoji}</AppText>
          <AppText style={styles.objectName}>{payload.name}</AppText>
          <View style={styles.valueLine}>
            <AppText style={styles.valueText}>{payload.value}</AppText>
            <View style={styles.unitSlot}>
              <AppText style={styles.unitSlotText}>?</AppText>
            </View>
          </View>
        </View>
        <View style={styles.choicesGrid}>
          {payload.choices.map((u) => (
            <Pressable
              key={u}
              style={[styles.choice, isDisabled && styles.disabled]}
              onPress={() => submit(u)}
              disabled={isDisabled}
            >
              <AppText style={styles.choiceText}>{u}</AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  if (payload.mode === 'convert') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText style={styles.prompt}>{t('game.measures.convertPrompt')}</AppText>
        <View style={styles.convertBox}>
          <AppText style={styles.convertText}>
            {payload.fromValue} {payload.fromLabel} = <AppText style={styles.question}>?</AppText> {payload.toLabel}
          </AppText>
        </View>
        <View style={styles.choicesGrid}>
          {payload.choices.map((n) => (
            <Pressable
              key={n}
              style={[styles.choice, isDisabled && styles.disabled]}
              onPress={() => submit(String(n))}
              disabled={isDisabled}
            >
              <AppText style={styles.choiceText}>{n}</AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  // compare
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <AppText style={styles.prompt}>{t('game.measures.comparePrompt')}</AppText>
      <View style={styles.compareBox}>
        <View style={styles.compareSide}>
          <AppText style={styles.compareValue}>{payload.leftValue}</AppText>
          <AppText style={styles.compareUnit}>{payload.leftLabel}</AppText>
        </View>
        <View style={styles.compareSlot}>
          <AppText style={styles.compareSlotText}>?</AppText>
        </View>
        <View style={styles.compareSide}>
          <AppText style={styles.compareValue}>{payload.rightValue}</AppText>
          <AppText style={styles.compareUnit}>{payload.rightLabel}</AppText>
        </View>
      </View>
      <View style={styles.compareButtonsRow}>
        {payload.choices.map((c) => (
          <Pressable
            key={c}
            style={[styles.compareBtn, isDisabled && styles.disabled]}
            onPress={() => submit(c)}
            disabled={isDisabled}
          >
            <AppText style={styles.compareBtnText}>{c}</AppText>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  prompt: {
    fontSize: 20,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  objectCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    gap: spacing.sm,
    ...shadows.card,
  },
  objectEmoji: {
    fontSize: 72,
    lineHeight: 80,
  },
  objectName: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    color: colors.text,
    textAlign: 'center',
  },
  valueLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  valueText: {
    fontSize: 48,
    lineHeight: 56,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
  unitSlot: {
    width: 72,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitSlotText: {
    fontSize: 32,
    fontFamily: fontFamily.extraBold,
    color: colors.primary,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  choice: {
    width: '46%',
    minHeight: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    ...shadows.card,
  },
  choiceText: {
    fontSize: 28,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
  disabled: {
    opacity: 0.5,
  },
  convertBox: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  convertText: {
    fontSize: 40,
    lineHeight: 50,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  question: {
    color: colors.primary,
  },
  compareBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    ...shadows.card,
  },
  compareSide: {
    alignItems: 'center',
    flex: 1,
  },
  compareValue: {
    fontSize: 44,
    lineHeight: 52,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
  compareUnit: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
  },
  compareSlot: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareSlotText: {
    fontSize: 32,
    fontFamily: fontFamily.extraBold,
    color: colors.primary,
  },
  compareButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  compareBtn: {
    flex: 1,
    minHeight: 92,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  compareBtnText: {
    fontSize: 48,
    lineHeight: 56,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
});

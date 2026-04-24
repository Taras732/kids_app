import { useEffect, useState } from 'react';
import { View, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily, shadows } from '../../constants/theme';
import type { RendererProps } from '../types';

export type TimesOp = '×' | '÷';

export interface TimesPayload {
  a: number;
  b: number;
  op: TimesOp;
  correct: number;
  choices: number[];
  hintBase: number;
  hintRowsUpTo: number;
  hintTargetB: number;
}

export type TimesAnswer = number;

export function Renderer({ task, onAnswer, disabled }: RendererProps<TimesAnswer>) {
  const payload = task.payload as TimesPayload;
  const [locked, setLocked] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    setLocked(false);
    setHintOpen(false);
  }, [task.id]);

  const handlePress = (value: number) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const isDisabled = disabled || locked;

  return (
    <View style={styles.wrap}>
      <View style={styles.exprBox}>
        <AppText style={styles.exprText}>
          {payload.a} {payload.op} {payload.b} =
        </AppText>
        <AppText style={styles.exprQuestion}>?</AppText>
        <Pressable
          style={styles.hintBtn}
          onPress={() => setHintOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="підказка"
          hitSlop={6}
        >
          <AppText style={styles.hintBtnText}>💡</AppText>
        </Pressable>
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
            <AppText style={styles.choiceText}>{n}</AppText>
          </Pressable>
        ))}
      </View>

      <Modal
        visible={hintOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setHintOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setHintOpen(false)}>
          <Pressable style={styles.hintCard} onPress={(e) => e.stopPropagation?.()}>
            <AppText style={styles.hintTitle}>Таблиця на {payload.hintBase}</AppText>
            <ScrollView style={styles.hintScroll} contentContainerStyle={styles.hintScrollContent}>
              {Array.from({ length: payload.hintRowsUpTo }).map((_, i) => {
                const factor = i + 1;
                const result = payload.hintBase * factor;
                const highlight = factor === payload.hintTargetB;
                return (
                  <View
                    key={factor}
                    style={[styles.hintRow, highlight && styles.hintRowActive]}
                  >
                    <AppText style={[styles.hintRowText, highlight && styles.hintRowTextActive]}>
                      {payload.hintBase} × {factor} = {result}
                    </AppText>
                  </View>
                );
              })}
            </ScrollView>
            <Pressable
              style={styles.hintClose}
              onPress={() => setHintOpen(false)}
              accessibilityRole="button"
            >
              <AppText style={styles.hintCloseText}>Зрозуміло</AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.lg,
  },
  exprBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 150,
    ...shadows.card,
  },
  exprText: {
    fontSize: 48,
    lineHeight: 58,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
  exprQuestion: {
    fontSize: 48,
    lineHeight: 58,
    fontFamily: fontFamily.extraBold,
    color: colors.primary,
  },
  hintBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  hintBtnText: {
    fontSize: 22,
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
    fontSize: 40,
    lineHeight: 48,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  hintCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.cardRaised,
  },
  hintTitle: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  hintScroll: {
    maxHeight: 400,
  },
  hintScrollContent: {
    gap: 6,
  },
  hintRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
  },
  hintRowActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  hintRowText: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    color: colors.text,
    textAlign: 'center',
  },
  hintRowTextActive: {
    color: colors.primary,
  },
  hintClose: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  hintCloseText: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#fff',
  },
});

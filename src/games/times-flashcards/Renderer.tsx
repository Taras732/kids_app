import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily, shadows } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export type FlashOp = '×' | '÷';

export interface FlashPayload {
  a: number;
  b: number;
  op: FlashOp;
  correct: number;
}

export type FlashAnswer = 'known' | 'unknown';

type Phase = 'front' | 'back';

export function Renderer({ task, onAnswer, disabled }: RendererProps<FlashAnswer>) {
  const payload = task.payload as FlashPayload;
  const [phase, setPhase] = useState<Phase>('front');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setPhase('front');
    setLocked(false);
  }, [task.id]);

  const flip = () => {
    if (disabled || locked || phase !== 'front') return;
    setPhase('back');
  };

  const rate = (value: FlashAnswer) => {
    if (disabled || locked || phase !== 'back') return;
    setLocked(true);
    onAnswer(value);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.card, phase === 'back' && styles.cardBack]}
        onPress={flip}
        disabled={disabled || locked || phase !== 'front'}
      >
        {phase === 'front' ? (
          <AppText style={styles.cardText}>
            {payload.a} {payload.op} {payload.b} = <AppText style={styles.questionMark}>?</AppText>
          </AppText>
        ) : (
          <AppText style={styles.cardText}>
            {payload.a} {payload.op} {payload.b} =
            <AppText style={styles.answerText}> {payload.correct}</AppText>
          </AppText>
        )}
      </Pressable>

      {phase === 'front' ? (
        <Pressable
          style={styles.showBtn}
          onPress={flip}
          disabled={disabled || locked}
        >
          <AppText style={styles.showBtnText}>{t('game.timesFlashcards.show')}</AppText>
        </Pressable>
      ) : (
        <View style={styles.rateRow}>
          <AppText style={styles.rateLabel}>{t('game.timesFlashcards.selfRate')}</AppText>
          <View style={styles.rateBtnsRow}>
            <Pressable
              style={[styles.rateBtn, styles.rateBtnUnknown, locked && styles.disabled]}
              onPress={() => rate('unknown')}
              disabled={disabled || locked}
            >
              <AppText style={styles.rateBtnText}>✗ {t('game.timesFlashcards.unknown')}</AppText>
            </Pressable>
            <Pressable
              style={[styles.rateBtn, styles.rateBtnKnown, locked && styles.disabled]}
              onPress={() => rate('known')}
              disabled={disabled || locked}
            >
              <AppText style={[styles.rateBtnText, { color: '#fff' }]}>
                ✓ {t('game.timesFlashcards.known')}
              </AppText>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    minHeight: 220,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    ...shadows.cardRaised,
  },
  cardBack: {
    backgroundColor: colors.primaryLight,
  },
  cardText: {
    fontSize: 56,
    lineHeight: 68,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  questionMark: {
    color: colors.primary,
  },
  answerText: {
    color: colors.primary,
  },
  showBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    ...shadows.cardRaised,
  },
  showBtnText: {
    fontSize: 18,
    fontFamily: fontFamily.extraBold,
    color: '#fff',
  },
  rateRow: {
    width: '100%',
    gap: spacing.sm,
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
  },
  rateBtnsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  rateBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  rateBtnUnknown: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 2,
    borderColor: colors.border,
  },
  rateBtnKnown: {
    backgroundColor: '#22C55E',
  },
  rateBtnText: {
    fontSize: 18,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
  disabled: {
    opacity: 0.5,
  },
});

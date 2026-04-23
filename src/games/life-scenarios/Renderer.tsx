import { useEffect, useRef, useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { colors, radius, spacing, fontFamily, shadows } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';
import { EMOTION_LABELS, type EmotionTag, type ScenarioAction } from './scenarios';

export interface LifeScenarioPayload {
  scenarioKey: string;
  situation: string;
  icon: string;
  actions: ScenarioAction[];
  showEmotions: boolean;
  showConsequence: boolean;
  availableEmotions: EmotionTag[];
  inputTimeLimitSec?: number;
}

export interface LifeScenarioAnswer {
  emotions: EmotionTag[];
  actionKey: string;
}

type Phase = 'situation' | 'feel' | 'act' | 'result';

export function Renderer({ task, onAnswer, disabled }: RendererProps<LifeScenarioAnswer>) {
  const payload = task.payload as LifeScenarioPayload;
  const [phase, setPhase] = useState<Phase>('situation');
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionTag[]>([]);
  const [chosenAction, setChosenAction] = useState<ScenarioAction | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    setPhase('situation');
    setSelectedEmotions([]);
    setChosenAction(null);
    submittedRef.current = false;
  }, [task.id]);

  useEffect(() => {
    if (phase !== 'act' || !payload.inputTimeLimitSec) return;
    const timer = setTimeout(() => {
      if (submittedRef.current || chosenAction) return;
      submittedRef.current = true;
      onAnswer({ emotions: selectedEmotions, actionKey: '' });
    }, payload.inputTimeLimitSec * 1000);
    return () => clearTimeout(timer);
  }, [phase, payload.inputTimeLimitSec, onAnswer, chosenAction, selectedEmotions]);

  const goToActions = () => {
    if (payload.showEmotions && phase === 'situation') {
      setPhase('feel');
      return;
    }
    setPhase('act');
  };

  const goFromFeelings = () => {
    setPhase('act');
  };

  const onPickAction = (action: ScenarioAction) => {
    if (submittedRef.current || disabled) return;
    setChosenAction(action);
    if (payload.showConsequence) {
      setPhase('result');
      return;
    }
    submittedRef.current = true;
    onAnswer({ emotions: selectedEmotions, actionKey: action.key });
  };

  const finish = () => {
    if (submittedRef.current || !chosenAction) return;
    submittedRef.current = true;
    onAnswer({ emotions: selectedEmotions, actionKey: chosenAction.key });
  };

  const toggleEmotion = (tag: EmotionTag) => {
    setSelectedEmotions((prev) =>
      prev.includes(tag) ? prev.filter((e) => e !== tag) : [...prev, tag],
    );
  };

  if (phase === 'situation') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.scenarioHero}>
          <AppText style={styles.hugeIcon}>{payload.icon}</AppText>
          <AppText style={styles.situationText}>{payload.situation}</AppText>
        </View>
        <AppButton title={t('game.lifeScenarios.next')} size="lg" tone="primary" onPress={goToActions} />
      </ScrollView>
    );
  }

  if (phase === 'feel') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText style={styles.phaseTitle}>{t('game.lifeScenarios.phaseFeel')}</AppText>
        <AppText style={styles.phaseHint}>{t('game.lifeScenarios.feelHint')}</AppText>
        <View style={styles.emotionsGrid}>
          {payload.availableEmotions.map((tag) => {
            const active = selectedEmotions.includes(tag);
            const meta = EMOTION_LABELS[tag];
            return (
              <Pressable
                key={tag}
                style={[styles.emotionCard, active && styles.emotionCardActive]}
                onPress={() => toggleEmotion(tag)}
              >
                <AppText style={styles.emotionEmoji}>{meta.emoji}</AppText>
                <AppText style={styles.emotionLabel}>{meta.label}</AppText>
              </Pressable>
            );
          })}
        </View>
        <AppButton title={t('game.lifeScenarios.next')} size="lg" tone="primary" onPress={goFromFeelings} />
        <AppButton title={t('game.lifeScenarios.skip')} tone="ghost" onPress={goFromFeelings} />
      </ScrollView>
    );
  }

  if (phase === 'act') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText style={styles.phaseTitle}>{t('game.lifeScenarios.phaseAct')}</AppText>
        <View style={styles.situationRecap}>
          <AppText style={styles.recapIcon}>{payload.icon}</AppText>
          <AppText style={styles.recapText}>{payload.situation}</AppText>
        </View>
        <View style={styles.actionsList}>
          {payload.actions.map((action) => (
            <Pressable
              key={action.key}
              style={styles.actionCard}
              onPress={() => onPickAction(action)}
              disabled={!!disabled || submittedRef.current}
            >
              <AppText style={styles.actionLabel}>{action.label}</AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  // phase === 'result'
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <AppText style={styles.phaseTitle}>{t('game.lifeScenarios.phaseResult')}</AppText>
      <View style={[styles.consequenceBox, chosenAction?.isBest ? styles.consequenceBest : styles.consequenceAlt]}>
        <AppText style={styles.consequenceEmoji}>{chosenAction?.isBest ? '💚' : '💭'}</AppText>
        <AppText style={styles.consequenceText}>{chosenAction?.consequence}</AppText>
      </View>
      <AppButton title={t('game.lifeScenarios.next')} size="lg" tone="primary" onPress={finish} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  scenarioHero: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    gap: spacing.md,
    ...shadows.card,
  },
  hugeIcon: {
    fontSize: 96,
    lineHeight: 110,
  },
  situationText: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  phaseTitle: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  phaseHint: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  emotionCard: {
    width: '30%',
    minHeight: 90,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    ...shadows.card,
  },
  emotionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  emotionEmoji: {
    fontSize: 32,
  },
  emotionLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.text,
    textAlign: 'center',
  },
  situationRecap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
  },
  recapIcon: {
    fontSize: 36,
  },
  recapText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  actionsList: {
    gap: spacing.sm,
  },
  actionCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.card,
  },
  actionLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
  consequenceBox: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.card,
  },
  consequenceBest: {
    backgroundColor: '#DCFCE7',
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  consequenceAlt: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 2,
    borderColor: colors.border,
  },
  consequenceEmoji: {
    fontSize: 48,
  },
  consequenceText: {
    fontSize: 17,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'center',
  },
});

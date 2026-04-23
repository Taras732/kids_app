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

type Phase = 'main' | 'result';

export function Renderer({ task, onAnswer, disabled }: RendererProps<LifeScenarioAnswer>) {
  const payload = task.payload as LifeScenarioPayload;
  const [phase, setPhase] = useState<Phase>('main');
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionTag[]>([]);
  const [chosenAction, setChosenAction] = useState<ScenarioAction | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    setPhase('main');
    setSelectedEmotions([]);
    setChosenAction(null);
    submittedRef.current = false;
  }, [task.id]);

  useEffect(() => {
    if (phase !== 'main' || !payload.inputTimeLimitSec) return;
    const timer = setTimeout(() => {
      if (submittedRef.current || chosenAction) return;
      submittedRef.current = true;
      onAnswer({ emotions: selectedEmotions, actionKey: '' });
    }, payload.inputTimeLimitSec * 1000);
    return () => clearTimeout(timer);
  }, [phase, payload.inputTimeLimitSec, onAnswer, chosenAction, selectedEmotions]);

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

  if (phase === 'main') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.scenarioHero}>
          <AppText style={styles.icon}>{payload.icon}</AppText>
          <AppText style={styles.situationText}>{payload.situation}</AppText>
        </View>

        {payload.showEmotions ? (
          <View style={styles.emotionsSection}>
            <AppText style={styles.emotionsLabel}>{t('game.lifeScenarios.phaseFeel')}</AppText>
            <View style={styles.emotionsChips}>
              {payload.availableEmotions.map((tag) => {
                const active = selectedEmotions.includes(tag);
                const meta = EMOTION_LABELS[tag];
                return (
                  <Pressable
                    key={tag}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleEmotion(tag)}
                  >
                    <AppText style={styles.chipEmoji}>{meta.emoji}</AppText>
                    <AppText style={[styles.chipLabel, active && styles.chipLabelActive]}>
                      {meta.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.actionsSection}>
          <AppText style={styles.actionsLabel}>{t('game.lifeScenarios.phaseAct')}</AppText>
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    gap: spacing.sm,
    ...shadows.card,
  },
  icon: {
    fontSize: 64,
    lineHeight: 72,
  },
  situationText: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  emotionsSection: {
    gap: spacing.xs,
  },
  emotionsLabel: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    paddingHorizontal: spacing.xs,
  },
  emotionsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipLabel: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
  chipLabelActive: {
    color: colors.primary,
  },
  actionsSection: {
    gap: spacing.xs,
  },
  actionsLabel: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    paddingHorizontal: spacing.xs,
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
  phaseTitle: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
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

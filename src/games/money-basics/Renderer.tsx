import { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily, shadows } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';
import { MoneyView, MoneyPile, formatAmount, type MoneyUnit } from './Money';

export type MoneyMode = 'count' | 'pay' | 'change';

export interface MoneyPayload {
  mode: MoneyMode;
  pile?: MoneyUnit[];
  targetKop?: number;
  priceKop?: number;
  paidKop?: number;
  choicesKop?: number[];
  availableDenominations?: number[];
  correctKop: number;
}

export type MoneyAnswer = number; // kopecks

export function Renderer({ task, onAnswer, disabled }: RendererProps<MoneyAnswer>) {
  const payload = task.payload as MoneyPayload;
  const [locked, setLocked] = useState(false);
  const [paid, setPaid] = useState<MoneyUnit[]>([]);

  useEffect(() => {
    setLocked(false);
    setPaid([]);
  }, [task.id]);

  const submit = (value: number) => {
    if (disabled || locked) return;
    setLocked(true);
    onAnswer(value);
  };

  const isDisabled = disabled || locked;

  if (payload.mode === 'count') {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText style={styles.prompt}>{t('game.moneyBasics.countPrompt')}</AppText>
        <View style={styles.pileBox}>
          <MoneyPile items={payload.pile ?? []} size="md" />
        </View>
        <View style={styles.choicesGrid}>
          {(payload.choicesKop ?? []).map((kop) => (
            <Pressable
              key={kop}
              style={[styles.choice, isDisabled && styles.disabled]}
              onPress={() => submit(kop)}
              disabled={isDisabled}
            >
              <AppText style={styles.choiceText}>{formatAmount(kop)}</AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  if (payload.mode === 'pay') {
    const target = payload.targetKop ?? 0;
    const accumulated = paid.reduce((sum, m) => sum + m.valueKop, 0);
    const overshoot = accumulated > target;
    const exact = accumulated === target;

    const addCoin = (valueKop: number) => {
      if (isDisabled) return;
      setPaid([...paid, { valueKop }]);
    };

    const clear = () => {
      if (isDisabled) return;
      setPaid([]);
    };

    const confirm = () => {
      if (isDisabled) return;
      submit(accumulated);
    };

    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText style={styles.prompt}>
          {t('game.moneyBasics.payPrompt', { amount: formatAmount(target) })}
        </AppText>

        <View style={[styles.trayBox, exact && styles.trayBoxOk, overshoot && styles.trayBoxErr]}>
          {paid.length === 0 ? (
            <AppText style={styles.trayEmpty}>{t('game.moneyBasics.trayEmpty')}</AppText>
          ) : (
            <MoneyPile items={paid} size="sm" />
          )}
          <AppText style={styles.trayTotal}>
            {t('game.moneyBasics.total')}: {formatAmount(accumulated)}
          </AppText>
        </View>

        <AppText style={styles.sectionLabel}>{t('game.moneyBasics.chooseDenominations')}</AppText>
        <View style={styles.denomsGrid}>
          {(payload.availableDenominations ?? []).map((kop) => (
            <Pressable
              key={kop}
              onPress={() => addCoin(kop)}
              disabled={isDisabled}
              style={styles.denomBtn}
            >
              <MoneyView valueKop={kop} size="sm" />
            </Pressable>
          ))}
        </View>

        <View style={styles.payActions}>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnGhost]}
            onPress={clear}
            disabled={isDisabled || paid.length === 0}
          >
            <AppText style={styles.actionBtnText}>{t('game.moneyBasics.clear')}</AppText>
          </Pressable>
          <Pressable
            style={[
              styles.actionBtn,
              styles.actionBtnPrimary,
              (!exact || isDisabled) && styles.disabled,
            ]}
            onPress={confirm}
            disabled={!exact || isDisabled}
          >
            <AppText style={[styles.actionBtnText, { color: '#fff' }]}>{t('common.continue')}</AppText>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // change mode
  const price = payload.priceKop ?? 0;
  const paidCash = payload.paidKop ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <AppText style={styles.prompt}>{t('game.moneyBasics.changePrompt')}</AppText>
      <View style={styles.changeBox}>
        <View style={styles.changeRow}>
          <AppText style={styles.changeLabel}>{t('game.moneyBasics.price')}:</AppText>
          <AppText style={styles.changeValue}>{formatAmount(price)}</AppText>
        </View>
        <View style={styles.changeRow}>
          <AppText style={styles.changeLabel}>{t('game.moneyBasics.paid')}:</AppText>
          <AppText style={styles.changeValue}>{formatAmount(paidCash)}</AppText>
        </View>
      </View>
      <AppText style={styles.subPrompt}>{t('game.moneyBasics.changeAsk')}</AppText>
      <View style={styles.choicesGrid}>
        {(payload.choicesKop ?? []).map((kop) => (
          <Pressable
            key={kop}
            style={[styles.choice, isDisabled && styles.disabled]}
            onPress={() => submit(kop)}
            disabled={isDisabled}
          >
            <AppText style={styles.choiceText}>{formatAmount(kop)}</AppText>
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
  subPrompt: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textAlign: 'center',
  },
  pileBox: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  choice: {
    width: '46%',
    minHeight: 72,
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
    fontSize: 20,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
  disabled: {
    opacity: 0.5,
  },
  trayBox: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    minHeight: 100,
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.card,
  },
  trayBoxOk: {
    borderColor: '#22C55E',
    backgroundColor: '#DCFCE7',
  },
  trayBoxErr: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  trayEmpty: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  trayTotal: {
    fontSize: 18,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
  },
  denomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  denomBtn: {
    padding: 2,
  },
  payActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnGhost: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 2,
    borderColor: colors.border,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
  },
  actionBtnText: {
    fontSize: 16,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
  changeBox: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    gap: spacing.sm,
    ...shadows.card,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeLabel: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
  },
  changeValue: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
});

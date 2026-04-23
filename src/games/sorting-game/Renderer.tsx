import { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../../components/AppText';
import { colors, radius, spacing, fontFamily, shadows } from '../../constants/theme';
import { t } from '../../i18n';
import type { RendererProps } from '../types';

export interface SortingItem {
  id: string;
  display: string;
}

export interface SortingPayload {
  setKey: string;
  attrKey: string;
  correctOrder: string[];
  shuffledOrder: SortingItem[];
  inputTimeLimitSec?: number;
}

export type SortingAnswer = string[];

export function Renderer({ task, onAnswer, disabled }: RendererProps<SortingAnswer>) {
  const payload = task.payload as SortingPayload;
  const [tapped, setTapped] = useState<string[]>([]);
  const submittedRef = useRef(false);

  useEffect(() => {
    setTapped([]);
    submittedRef.current = false;
  }, [task.id]);

  useEffect(() => {
    if (!payload.inputTimeLimitSec) return;
    const timer = setTimeout(() => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      onAnswer(tapped);
    }, payload.inputTimeLimitSec * 1000);
    return () => clearTimeout(timer);
  }, [payload.inputTimeLimitSec, onAnswer, tapped]);

  const handleTap = (id: string) => {
    if (disabled || submittedRef.current) return;
    if (tapped.includes(id)) return;
    const next = [...tapped, id];
    setTapped(next);
    if (next.length === payload.correctOrder.length) {
      submittedRef.current = true;
      setTimeout(() => onAnswer(next), 220);
    }
  };

  const attrPrompt = t(payload.attrKey);
  const itemSize = payload.shuffledOrder.length <= 3 ? 72 : payload.shuffledOrder.length <= 4 ? 60 : 52;

  return (
    <View style={styles.wrap}>
      <AppText style={styles.prompt}>{t('game.sortingGame.prompt')}</AppText>
      <AppText style={styles.attr}>{attrPrompt}</AppText>

      <View style={styles.itemsRow}>
        {payload.shuffledOrder.map((item) => {
          const orderIdx = tapped.indexOf(item.id);
          const isTapped = orderIdx !== -1;
          return (
            <Pressable
              key={item.id}
              style={[styles.item, isTapped && styles.itemTapped]}
              onPress={() => handleTap(item.id)}
              disabled={disabled || isTapped}
              accessibilityRole="button"
              accessibilityLabel={item.display}
              hitSlop={4}
            >
              <AppText style={[styles.itemGlyph, { fontSize: itemSize, lineHeight: itemSize + 8 }]}>
                {item.display}
              </AppText>
              {isTapped ? (
                <View style={styles.badge}>
                  <AppText style={styles.badgeText}>{orderIdx + 1}</AppText>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prompt: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
    textAlign: 'center',
  },
  attr: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.md,
  },
  item: {
    minWidth: 88,
    minHeight: 108,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  itemTapped: {
    opacity: 0.55,
    borderColor: colors.primary,
  },
  itemGlyph: {
    textAlign: 'center',
    fontFamily: fontFamily.extraBold,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.cardRaised,
  },
  badgeText: {
    fontSize: 18,
    fontFamily: fontFamily.extraBold,
    color: '#FFFFFF',
  },
});

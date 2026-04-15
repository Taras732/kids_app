import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { AppText } from '../AppText';
import { colors, radius, spacing } from '../../constants/theme';

export type FeedbackKind = 'correct' | 'wrong';

interface Props {
  visible: boolean;
  kind: FeedbackKind;
  messageCorrect: string;
  messageWrong: string;
}

export function FeedbackOverlay({ visible, kind, messageCorrect, messageWrong }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      scale.setValue(0.7);
    }
  }, [visible, opacity, scale]);

  if (!visible) return null;

  const isCorrect = kind === 'correct';
  const icon = isCorrect ? '✓' : '✗';
  const emoji = isCorrect ? '🎉' : '🤔';
  const message = isCorrect ? messageCorrect : messageWrong;
  const tint = isCorrect ? colors.success : colors.warning;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.backdrop, { opacity }]}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <AppText variant="display" style={styles.emoji}>{emoji}</AppText>
        <View style={[styles.iconCircle, { backgroundColor: tint }]}>
          <AppText variant="h1" color="#FFFFFF">{icon}</AppText>
        </View>
        <AppText variant="h2" style={styles.msg}>{message}</AppText>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31, 27, 58, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 220,
  },
  emoji: {
    fontSize: 56,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msg: {
    textAlign: 'center',
  },
});

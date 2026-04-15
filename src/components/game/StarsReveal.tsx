import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { AppText } from '../AppText';
import { colors, spacing } from '../../constants/theme';

interface Props {
  stars: 1 | 2 | 3;
  total?: number;
  startDelayMs?: number;
  stepMs?: number;
}

export function StarsReveal({ stars, total = 3, startDelayMs = 200, stepMs = 400 }: Props) {
  const scales = useRef([...Array(total)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    scales.forEach((s) => s.setValue(0));
    const animations = scales.map((s, i) =>
      Animated.sequence([
        Animated.delay(startDelayMs + i * stepMs),
        Animated.spring(s, { toValue: 1, friction: 5, useNativeDriver: true }),
      ])
    );
    Animated.parallel(animations).start();
  }, [stars, total, startDelayMs, stepMs, scales]);

  return (
    <View style={styles.row}>
      {scales.map((scale, i) => {
        const earned = i < stars;
        return (
          <Animated.View key={i} style={{ transform: [{ scale }] }}>
            <AppText
              variant="display"
              style={[
                styles.star,
                !earned && { opacity: 0.25 },
              ]}
              color={earned ? colors.accentYellow : colors.textDisabled}
            >
              ★
            </AppText>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontSize: 72,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

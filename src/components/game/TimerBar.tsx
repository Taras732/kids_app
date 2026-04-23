import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

interface TimerBarProps {
  startedAt: number;
  durationSec: number;
  active: boolean;
}

export function TimerBar({ startedAt, durationSec, active }: TimerBarProps) {
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    progress.stopAnimation();
    if (!active) return;
    const elapsed = (Date.now() - startedAt) / 1000;
    const remainingSec = Math.max(0, durationSec - elapsed);
    const initial = Math.max(0, Math.min(1, remainingSec / durationSec));
    progress.setValue(initial);
    Animated.timing(progress, {
      toValue: 0,
      duration: remainingSec * 1000,
      useNativeDriver: false,
    }).start();
  }, [startedAt, durationSec, active, progress]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const color = progress.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: ['#E53935', '#FB8C00', '#FFB300', colors.success ?? '#4CAF50'],
  });

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { width, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});

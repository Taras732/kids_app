import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../AppText';
import { colors, radius, spacing } from '../../constants/theme';

interface Props {
  taskIndex: number;
  totalTasks: number;
  onBack: () => void;
}

export function GameHeader({ taskIndex, totalTasks, onBack }: Props) {
  const progress = totalTasks > 0 ? Math.min(1, (taskIndex) / totalTasks) : 0;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.backBtn}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
      >
        <AppText variant="h2" color={colors.primary}>✕</AppText>
      </Pressable>

      <View style={styles.progressWrap}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        <AppText variant="caption" color={colors.textMuted}>
          {Math.min(taskIndex + 1, totalTasks)}/{totalTasks}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
});

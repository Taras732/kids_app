import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { BADGES } from '@/src/constants/badges';
import { getIslandById } from '@/src/constants/islands';
import { useChildProfilesStore } from '@/src/stores/childProfilesStore';
import { useProgressStore } from '@/src/stores/progressStore';
import { colors, radius, spacing, shadows } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function BadgesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 50);
  const activeProfile = useChildProfilesStore((s) => s.getActiveProfile());
  const earnedList = useProgressStore((s) =>
    activeProfile ? s.badgesByProfile[activeProfile.id] ?? [] : [],
  );
  const earned = new Set(earnedList);
  const earnedCount = earned.size;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={{ flex: 1, paddingTop: topPad }}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="display" style={styles.titleIcon}>🏆</AppText>
        <AppText variant="title" style={styles.title}>
          {t('hub.badgesTitle')}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.counter}>
          {earnedCount} / {BADGES.length}
        </AppText>

        <View style={styles.grid}>
          {BADGES.map((badge) => {
            const isEarned = earned.has(badge.id);
            const island = badge.islandId ? getIslandById(badge.islandId) : undefined;
            const borderColor = island?.color ?? colors.primary;
            return (
              <View
                key={badge.id}
                style={[
                  styles.card,
                  isEarned
                    ? { borderColor, opacity: 1 }
                    : { borderColor: colors.border, opacity: 0.4 },
                ]}
              >
                <View style={styles.iconWrap}>
                  <AppText style={[styles.icon, !isEarned && styles.iconLocked]}>
                    {badge.icon}
                  </AppText>
                  {!isEarned ? (
                    <AppText style={styles.lockOverlay}>🔒</AppText>
                  ) : null}
                </View>
                <AppText
                  variant="body"
                  style={styles.name}
                  numberOfLines={2}
                >
                  {t(`badges.${badge.id}.name`)}
                </AppText>
                <AppText
                  variant="caption"
                  color={colors.textMuted}
                  style={styles.desc}
                  numberOfLines={2}
                >
                  {isEarned ? t(`badges.${badge.id}.description`) : '???'}
                </AppText>
              </View>
            );
          })}
        </View>

        <AppButton title={t('common.back')} tone="ghost" onPress={() => router.replace('/(main)')} />
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleIcon: { fontSize: 56 },
  title: { fontWeight: '800' },
  counter: { marginBottom: spacing.sm },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 2,
    ...shadows.card,
  },
  iconWrap: {
    position: 'relative',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 64 },
  iconLocked: { opacity: 0.6 },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontSize: 24,
  },
  name: { fontWeight: '700', textAlign: 'center' },
  desc: { textAlign: 'center', minHeight: 32 },
});

import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { colors, radius, spacing, shadows } from '@/src/constants/theme';
import { useChildProfilesStore } from '@/src/stores/childProfilesStore';
import { useProgressStore } from '@/src/stores/progressStore';
import { t } from '@/src/i18n';

export default function ChildProgressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 50);

  const activeId = useChildProfilesStore((s) => s.activeProfileId);
  const getXp = useProgressStore((s) => s.getXp);
  const getLevel = useProgressStore((s) => s.getLevel);
  const badgesMap = useProgressStore((s) => s.badgesByProfile);

  const xp = activeId ? getXp(activeId) : 0;
  const level = activeId ? getLevel(activeId) : 1;
  const badges = activeId ? (badgesMap[activeId]?.length ?? 0) : 0;
  const streak = 0;

  const week = [40, 65, 30, 80, 55, 90, 60];
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Pressable
          onPress={() => router.replace('/(main)')}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <AppText variant="h2" color={colors.primary}>‹</AppText>
        </Pressable>
        <AppText variant="title">{t('parent.tabProgress')}</AppText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.statRow}>
          <StatCard value={String(xp)} label={t('parent.statXp')} />
          <StatCard value={String(level)} label={t('parent.statLevel')} />
          <StatCard value={`${streak} 🔥`} label={t('parent.statStreak')} />
          <StatCard value={String(badges)} label={t('parent.statBadges')} />
        </View>

        <View style={styles.panel}>
          <AppText variant="h2" style={styles.panelTitle}>{t('parent.weekActivity')}</AppText>
          <View style={styles.bars}>
            {week.map((h, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.bar, { height: h * 1.2 }]} />
                <AppText variant="caption" color={colors.textMuted}>{days[i]}</AppText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.panel}>
          <AppText variant="h2" style={styles.panelTitle}>{t('parent.recentActivity')}</AppText>
          <AppText variant="caption" color={colors.textMuted}>{t('parent.activityEmpty')}</AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <AppText variant="title" color={colors.primary}>{value}</AppText>
      <AppText variant="caption" color={colors.textMuted}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  contentInner: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.xs,
    ...shadows.card,
  },
  panel: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  panelTitle: { marginBottom: spacing.xs },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
    paddingHorizontal: spacing.xs,
  },
  barCol: { alignItems: 'center', gap: 4, flex: 1 },
  bar: {
    width: '70%',
    backgroundColor: colors.primaryLight,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    borderWidth: 0,
  },
});

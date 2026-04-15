import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { BottomTabBar } from '@/src/components/BottomTabBar';
import { ISLANDS } from '@/src/constants/islands';
import { colors, spacing, radius, shadows } from '@/src/constants/theme';
import { useChildProfilesStore } from '@/src/stores/childProfilesStore';
import { useProgressStore } from '@/src/stores/progressStore';
import { t } from '@/src/i18n';

export default function HubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 50);
  const activeProfile = useChildProfilesStore((s) => s.getActiveProfile());
  const level = useProgressStore((s) => (activeProfile ? s.getLevel(activeProfile.id) : 1));
  const xp = useProgressStore((s) => (activeProfile ? s.getXp(activeProfile.id) : 0));
  const xpForLevel = 100;
  const xpInLevel = xp % xpForLevel;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <AppText style={{ fontSize: 28 }}>{activeProfile?.avatarId ?? '🐱'}</AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="caption" color={colors.textMuted}>Привіт,</AppText>
            <AppText variant="h2" style={{ fontWeight: '800' }}>
              {activeProfile?.name ?? '👋'}!
            </AppText>
          </View>
          <Pressable style={styles.parentBtn} onPress={() => router.push('/(parent)/dashboard')}>
            <AppText style={{ fontSize: 22 }}>👨‍👩‍👧</AppText>
          </Pressable>
        </View>

        <View style={styles.xpCard}>
          <View style={styles.xpRow}>
            <View>
              <AppText variant="caption" color="rgba(255,255,255,0.85)">
                {t('hub.level', { level })}
              </AppText>
              <AppText variant="h2" color="#fff" style={{ fontWeight: '800' }}>
                {xpInLevel} / {xpForLevel} XP
              </AppText>
            </View>
            <View style={styles.xpBadge}>
              <AppText color="#fff" style={{ fontWeight: '700' }}>🔥 0 днів</AppText>
            </View>
          </View>
          <View style={styles.xpBar}>
            <View style={[styles.xpBarFill, { width: `${(xpInLevel / xpForLevel) * 100}%` }]} />
          </View>
        </View>

        <AppText variant="h2" style={styles.sectionTitle}>
          {t('hub.islands')}
        </AppText>

        <View style={styles.grid}>
          {ISLANDS.map((island) => (
            <Pressable
              key={island.id}
              style={{ ...styles.card, backgroundColor: island.color }}
              onPress={() => router.push({ pathname: '/(main)/island/[id]', params: { id: island.id } })}
            >
              <AppText style={{ fontSize: 40 }}>{island.icon}</AppText>
              <AppText variant="body" color="#fff" style={{ fontWeight: '700', textAlign: 'center' }}>
                {island.name}
              </AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar
        activeKey="islands"
        tabs={[
          { key: 'islands', icon: '🏝', label: t('hub.tabIslands') },
          { key: 'badges', icon: '🏆', label: t('hub.tabBadges'), disabled: true },
          { key: 'avatar', icon: '😀', label: t('hub.tabAvatar'), disabled: true },
          { key: 'parents', icon: '👨‍👩‍👧', label: t('hub.tabParents'), onPress: () => router.push('/(parent)/dashboard') },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  parentBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  xpCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.cardRaised,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.smd,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.accentYellow,
    borderRadius: radius.full,
  },
  sectionTitle: {
    marginTop: spacing.xs,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    ...shadows.card,
  },
});

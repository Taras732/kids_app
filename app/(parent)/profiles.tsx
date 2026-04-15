import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { useChildProfilesStore } from '@/src/stores/childProfilesStore';
import { getAgeGroupById } from '@/src/constants/ageGroups';
import { colors, spacing, radius, shadows } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function ProfilesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 50);
  const profiles = useChildProfilesStore((s) => s.profiles);
  const activeProfileId = useChildProfilesStore((s) => s.activeProfileId);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: topPad }]}>
        <AppText variant="h1" style={styles.title}>
          {t('parent.profiles')}
        </AppText>

        {profiles.length === 0 ? (
          <AppText variant="body" color={colors.textMuted} style={styles.empty}>
            {t('profiles.empty')}
          </AppText>
        ) : (
          profiles.map((p) => {
            const group = getAgeGroupById(p.ageGroupId);
            const isActive = p.id === activeProfileId;
            return (
              <Pressable
                key={p.id}
                style={styles.card}
                onPress={() => router.push({ pathname: '/(parent)/profile-edit/[id]', params: { id: p.id } })}
                accessibilityRole="button"
              >
                <View style={styles.avatarCircle}>
                  <AppText style={styles.avatar}>{p.avatarId || group?.mascot || '🐱'}</AppText>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <AppText variant="h2" style={{ fontWeight: '800' }} numberOfLines={1}>
                      {p.name}
                    </AppText>
                    {isActive ? (
                      <View style={styles.activeBadge}>
                        <AppText variant="caption" color="#fff" style={{ fontWeight: '700' }}>
                          {t('profiles.active')}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                  <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
                    {group?.mascot} {group?.name} · {group?.ageRange}
                  </AppText>
                </View>
                <AppText style={styles.chev}>›</AppText>
              </Pressable>
            );
          })
        )}

        <AppButton
          title={t('profiles.addChild')}
          tone="outline"
          size="lg"
          onPress={() =>
            router.push({ pathname: '/(main)/onboarding/name', params: { mode: 'add' } })
          }
        />

        <AppButton title={t('common.back')} tone="ghost" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: { fontWeight: '800' },
  empty: { textAlign: 'center', paddingVertical: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.card,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { fontSize: 32 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  activeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  chev: {
    fontSize: 28,
    color: colors.textMuted,
    paddingHorizontal: spacing.sm,
  },
});

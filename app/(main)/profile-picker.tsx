import { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { useChildProfilesStore } from '@/src/stores/childProfilesStore';
import { getAgeGroupById } from '@/src/constants/ageGroups';
import { colors, spacing, radius, shadows } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function ProfilePickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 50);

  const profiles = useChildProfilesStore((s) => s.profiles);
  const activeProfileId = useChildProfilesStore((s) => s.activeProfileId);
  const setActiveProfile = useChildProfilesStore((s) => s.setActiveProfile);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const choose = (id: string) => {
    setActiveProfile(id);
    router.replace('/(main)');
  };

  const addChild = () => {
    router.push({ pathname: '/(main)/onboarding/name', params: { mode: 'add' } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: topPad }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <AppText variant="h1" style={styles.title}>
              {t('picker.title')}
            </AppText>
          </View>
          <Pressable
            style={styles.gear}
            onPress={() => router.push('/(parent)/pin-gate')}
            accessibilityRole="button"
            accessibilityLabel={t('picker.settings')}
          >
            <AppText style={{ fontSize: 22 }}>⚙️</AppText>
          </Pressable>
        </View>

        <View style={styles.grid}>
          {profiles.map((p) => {
            const group = getAgeGroupById(p.ageGroupId);
            const isActive = p.id === activeProfileId;
            return (
              <Pressable
                key={p.id}
                style={[styles.card, isActive && styles.cardActive]}
                onPress={() => choose(p.id)}
                accessibilityRole="button"
                accessibilityLabel={`${p.name}, ${group?.ageRange ?? ''}`}
              >
                <View style={styles.avatarCircle}>
                  <AppText style={styles.avatar}>{p.avatarId || group?.mascot || '🐱'}</AppText>
                </View>
                <AppText variant="h2" style={styles.name} numberOfLines={1}>
                  {p.name}
                </AppText>
                {group ? (
                  <>
                    <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
                      {group.mascot} {group.ageRange}
                    </AppText>
                  </>
                ) : null}
                {isActive ? (
                  <View style={styles.activeBadge}>
                    <AppText variant="caption" color="#fff" style={{ fontWeight: '700' }}>
                      {t('profiles.active')}
                    </AppText>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <AppButton
          title={t('picker.addChild')}
          tone="outline"
          size="lg"
          onPress={addChild}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: { fontWeight: '800' },
  gear: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    aspectRatio: 0.9,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    ...shadows.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: {
    borderColor: colors.primary,
    ...shadows.cardRaised,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatar: { fontSize: 48 },
  name: { fontWeight: '800', textAlign: 'center' },
  activeBadge: {
    marginTop: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
});

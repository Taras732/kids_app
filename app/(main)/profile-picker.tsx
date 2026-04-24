import { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
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
      <View style={{ flex: 1, paddingTop: topPad }}>
        <ScrollView contentContainerStyle={styles.content}>
          <AppText variant="h1" style={styles.title}>
            {t('picker.title')}
          </AppText>

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
                  accessibilityLabel={`${p.name}, ${group?.name ?? ''}`}
                >
                  <View style={styles.avatarCircle}>
                    <AppText style={styles.avatar}>{p.avatarId || '🐱'}</AppText>
                  </View>
                  <AppText variant="h2" style={styles.name} numberOfLines={1}>
                    {p.name}
                  </AppText>
                  {group ? (
                    <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
                      {group.name}
                    </AppText>
                  ) : null}
                  <View style={[styles.playHint, isActive && styles.playHintActive]}>
                    <AppText style={[styles.playHintText, isActive && styles.playHintTextActive]}>
                      {t('picker.play')} ▶
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.addLink} onPress={addChild} accessibilityRole="button">
            <AppText style={styles.addLinkText}>+ {t('picker.addChild')}</AppText>
          </Pressable>
        </ScrollView>
      </View>
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
  title: { fontWeight: '800' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
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
  playHint: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
  },
  playHintActive: {
    backgroundColor: colors.primary,
  },
  playHintText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  playHintTextActive: {
    color: '#fff',
  },
  addLink: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  addLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});

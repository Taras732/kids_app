import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { ISLANDS } from '@/src/constants/islands';
import { colors, spacing, radius, shadows } from '@/src/constants/theme';
import { useChildProfilesStore } from '@/src/stores/childProfilesStore';
import { useProgressStore } from '@/src/stores/progressStore';
import { t } from '@/src/i18n';

export default function HubScreen() {
  const router = useRouter();
  const activeProfile = useChildProfilesStore((s) => s.getActiveProfile());
  const level = useProgressStore((s) => (activeProfile ? s.getLevel(activeProfile.id) : 1));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <AppText variant="title">{t('hub.greeting', { name: activeProfile?.name ?? '👋' })}</AppText>
            <AppText variant="caption" color={colors.textMuted}>{t('hub.level', { level })}</AppText>
          </View>
          <AppButton title={t('hub.parentMode')} size="sm" tone="ghost" onPress={() => router.push('/(parent)/dashboard')} />
        </View>

        <AppText variant="title" style={{ marginTop: spacing.lg }}>{t('hub.islands')}</AppText>
        <View style={styles.grid}>
          {ISLANDS.map((island) => (
            <Link key={island.id} href={{ pathname: '/(main)/island/[id]', params: { id: island.id } }} asChild>
              <Pressable style={[styles.card, { backgroundColor: island.color }]}>
                <AppText variant="display">{island.icon}</AppText>
                <AppText variant="body" color="#fff" style={{ fontWeight: '700' }}>{island.name}</AppText>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, gap: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  card: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.card,
  },
});

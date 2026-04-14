import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { useChildProfilesStore } from '@/src/stores/childProfilesStore';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function ProfilesScreen() {
  const router = useRouter();
  const profiles = useChildProfilesStore((s) => s.profiles);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title">{t('parent.profiles')}</AppText>
        {profiles.map((p) => (
          <AppText key={p.id} variant="body">• {p.avatarId} {p.name} ({p.ageGroupId})</AppText>
        ))}
        {profiles.length === 0 && <AppText variant="caption" color={colors.textMuted}>Профілів поки немає</AppText>}
        <AppButton title={t('common.back')} tone="ghost" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
});

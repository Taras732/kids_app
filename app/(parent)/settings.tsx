import { View, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useAuthStore } from '@/src/stores/authStore';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const { soundEnabled, musicEnabled, setSoundEnabled, setMusicEnabled } = useSettingsStore();
  const clearSession = useAuthStore((s) => s.clearSession);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title">{t('parent.settings')}</AppText>
        <View style={styles.row}>
          <AppText variant="body">Звуки</AppText>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
        </View>
        <View style={styles.row}>
          <AppText variant="body">Музика</AppText>
          <Switch value={musicEnabled} onValueChange={setMusicEnabled} />
        </View>
        <AppButton title="Вийти" tone="secondary" onPress={clearSession} />
        <AppButton title={t('common.back')} tone="ghost" onPress={() => router.replace('/(parent)/dashboard')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: colors.card, borderRadius: 12 },
});

import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { useSettingsStore } from '@/src/stores/settingsStore';
import type { Locale } from '@/src/i18n';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function LanguageScreen() {
  const router = useRouter();
  const setLocale = useSettingsStore((s) => s.setLocale);

  const choose = (locale: Locale) => {
    setLocale(locale);
    router.push('/(main)/onboarding/name');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title">{t('onboarding.chooseLanguage')}</AppText>
        <AppButton title="🇺🇦 Українська" size="lg" onPress={() => choose('uk')} />
        <AppButton title="🇬🇧 English" size="lg" tone="secondary" onPress={() => choose('en')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
});

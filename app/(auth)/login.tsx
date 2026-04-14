import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { useAuthStore } from '@/src/stores/authStore';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function LoginScreen() {
  const setSession = useAuthStore((s) => s.setSession);

  const handleDevLogin = () => {
    setSession('dev-user-id', 'dev@shkolyaryk.app');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="display">📚</AppText>
        <AppText variant="title">{t('app.name')}</AppText>
        <AppText variant="body" color={colors.textMuted}>{t('app.tagline')}</AppText>

        <View style={styles.actions}>
          <AppButton title={t('auth.signIn')} size="lg" onPress={handleDevLogin} />
          <Link href="/(auth)/register" asChild>
            <AppButton title={t('auth.signUp')} size="lg" tone="ghost" />
          </Link>
          <Link href="/(auth)/forgot-password" asChild>
            <AppButton title={t('auth.forgotPassword')} size="sm" tone="ghost" />
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  actions: { width: '100%', maxWidth: 360, gap: spacing.md, marginTop: spacing.xl },
});

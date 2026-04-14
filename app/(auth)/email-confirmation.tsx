import { View, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { useAuthStore } from '@/src/stores/authStore';
import { resendConfirmation, signOut } from '@/src/hooks/useAuthActions';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function EmailConfirmationScreen() {
  const email = useAuthStore((s) => s.email) ?? '';
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    const result = await resendConfirmation(email);
    setResending(false);
    Alert.alert(result.ok ? '✅' : '⚠️', result.ok ? t('auth.resetLinkSent', { email }) : result.error ?? 'Error');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="display">📧</AppText>
        <AppText variant="title">{t('auth.confirmEmailTitle')}</AppText>
        <AppText variant="body" color={colors.textMuted} style={{ textAlign: 'center' }}>
          {t('auth.confirmEmailHint', { email })}
        </AppText>
        <AppButton title={t('auth.resend')} size="md" onPress={handleResend} disabled={resending || !email} />
        <AppButton title={t('auth.signOut')} size="md" tone="ghost" onPress={() => void signOut()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
});

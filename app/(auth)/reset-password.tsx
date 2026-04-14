import { View, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { FormInput } from '@/src/components/FormInput';
import { updatePassword } from '@/src/hooks/useAuthActions';
import { isValidPassword } from '@/src/utils/validation';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordError = password.length > 0 && !isValidPassword(password) ? t('auth.errorPasswordShort') : null;
  const matchError = confirm.length > 0 && confirm !== password ? t('auth.errorPasswordsDoNotMatch') : null;
  const canSubmit = isValidPassword(password) && password === confirm && !submitting;

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await updatePassword(password);
    setSubmitting(false);
    if (result.ok) {
      Alert.alert('✅', 'Пароль оновлено');
      router.replace('/(main)');
    } else {
      Alert.alert('⚠️', result.error ?? 'Error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title">{t('auth.newPassword')}</AppText>
        <FormInput
          label={t('auth.newPassword')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={passwordError}
          autoCapitalize="none"
        />
        <FormInput
          label={t('auth.confirmPassword')}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          error={matchError}
          autoCapitalize="none"
        />
        <AppButton title={t('common.save')} size="lg" disabled={!canSubmit} onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
});

import { View, StyleSheet, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { colors, spacing, radius, fontSizes } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function NameScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [name, setName] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title">{t('onboarding.enterName')}</AppText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Софійка"
          style={styles.input}
          autoFocus
        />
        <AppButton
          title={t('common.continue')}
          size="lg"
          disabled={name.trim().length < 2}
          onPress={() => router.push({ pathname: '/(main)/onboarding/age-group', params: { name: name.trim(), ...(mode ? { mode } : {}) } })}
        />
        {router.canGoBack() ? (
          <AppButton title={t('common.back')} tone="ghost" onPress={() => router.back()} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSizes.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
});

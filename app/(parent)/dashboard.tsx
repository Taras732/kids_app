import { View, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { colors, spacing } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function ParentDashboardScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title">{t('parent.dashboard')}</AppText>
        <Link href="/(parent)/stats" asChild><AppButton title={t('parent.stats')} size="lg" /></Link>
        <Link href="/(parent)/profiles" asChild><AppButton title={t('parent.profiles')} size="lg" tone="secondary" /></Link>
        <Link href="/(parent)/settings" asChild><AppButton title={t('parent.settings')} size="lg" tone="secondary" /></Link>
        <AppButton title={t('common.back')} tone="ghost" onPress={() => router.replace('/(main)')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: 'center' },
});

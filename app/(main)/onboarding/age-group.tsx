import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { AGE_GROUPS, type AgeGroupId } from '@/src/constants/ageGroups';
import { colors, spacing, radius, shadows } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function AgeGroupScreen() {
  const router = useRouter();
  const { name, mode } = useLocalSearchParams<{ name: string; mode?: string }>();

  const choose = (id: AgeGroupId) => {
    router.push({
      pathname: '/(main)/onboarding/avatar',
      params: { name, ageGroupId: id, ...(mode ? { mode } : {}) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title">{t('onboarding.chooseAgeGroup')}</AppText>
        {AGE_GROUPS.map((group) => (
          <Pressable key={group.id} style={styles.card} onPress={() => choose(group.id)}>
            <AppText variant="display">{group.mascot}</AppText>
            <View style={{ flex: 1 }}>
              <AppText variant="body" style={{ fontWeight: '700' }}>{group.name}</AppText>
              <AppText variant="caption" color={colors.textMuted}>{group.ageRange}</AppText>
            </View>
          </Pressable>
        ))}
        <AppButton
          title={t('common.back')}
          tone="ghost"
          onPress={() =>
            router.replace({
              pathname: '/(main)/onboarding/name',
              params: mode ? { mode } : {},
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    ...shadows.card,
  },
});

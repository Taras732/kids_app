import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { useChildProfilesStore } from '@/src/stores/childProfilesStore';
import type { AgeGroupId } from '@/src/constants/ageGroups';
import { AVATARS } from '@/src/constants/avatars';
import { colors, spacing, radius } from '@/src/constants/theme';
import { t } from '@/src/i18n';

export default function AvatarScreen() {
  const router = useRouter();
  const { name, ageGroupId, mode } = useLocalSearchParams<{ name: string; ageGroupId: AgeGroupId; mode?: string }>();
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const addProfile = useChildProfilesStore((s) => s.addProfile);
  const setActiveProfile = useChildProfilesStore((s) => s.setActiveProfile);

  const confirm = () => {
    if (!avatarId || !name || !ageGroupId) return;
    const newId = addProfile({ name, ageGroupId, avatarId });
    if (mode === 'add') {
      setActiveProfile(newId);
      router.replace('/(main)');
    } else {
      router.replace('/(main)/onboarding/tutorial');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title">{t('onboarding.chooseAvatar')}</AppText>
        <View style={styles.grid}>
          {AVATARS.map((a) => (
            <Pressable
              key={a}
              onPress={() => setAvatarId(a)}
              style={[styles.avatar, avatarId === a && styles.avatarSelected]}
            >
              <AppText variant="display">{a}</AppText>
            </Pressable>
          ))}
        </View>
        <AppButton title={t('common.continue')} size="lg" disabled={!avatarId} onPress={confirm} />
        <AppButton
          title={t('common.back')}
          tone="ghost"
          onPress={() =>
            router.replace({
              pathname: '/(main)/onboarding/age-group',
              params: { name, ...(mode ? { mode } : {}) },
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, gap: spacing.lg, justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarSelected: { borderColor: colors.primary },
});

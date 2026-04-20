import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/src/components/AppText';
import { AppButton } from '@/src/components/AppButton';
import { GradientBackground } from '@/src/components/GradientBackground';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useSettingsStore } from '@/src/stores/settingsStore';
import type { Locale } from '@/src/i18n';
import { colors, spacing, radius, shadows } from '@/src/constants/theme';

interface LangOption {
  code: Locale;
  label: string;
  native: string;
  flag: string;
}

const options: LangOption[] = [
  { code: 'uk', label: 'Українська', native: 'Українська мова', flag: '🇺🇦' },
  { code: 'en', label: 'English', native: 'English language', flag: '🇬🇧' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const currentLocale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const markLanguageChosen = useOnboardingStore((s) => s.markLanguageChosen);
  const [selected, setSelected] = useState<Locale>(currentLocale);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const opacity1 = spin.interpolate({
    inputRange: [0, 0.16, 0.33, 0.5, 0.83, 1],
    outputRange: [1, 1, 0, 0, 0, 1],
  });
  const opacity2 = spin.interpolate({
    inputRange: [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1],
    outputRange: [0, 0, 1, 1, 0, 0, 0],
  });
  const opacity3 = spin.interpolate({
    inputRange: [0, 0.5, 0.66, 0.83, 1],
    outputRange: [0, 0, 1, 1, 0],
  });
  const scaleX = spin.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 0.85, 1, 0.85, 1],
  });

  const handleContinue = () => {
    setLocale(selected);
    markLanguageChosen();
    if (from === 'settings') {
      router.replace('/(parent)/settings');
    } else {
      router.replace('/welcome');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Animated.View style={[styles.globeWrap, { transform: [{ scaleX }] }]}>
              <Animated.Text style={[styles.emoji, styles.globeFace, { opacity: opacity1 }]}>
                🌍
              </Animated.Text>
              <Animated.Text style={[styles.emoji, styles.globeFace, { opacity: opacity2 }]}>
                🌎
              </Animated.Text>
              <Animated.Text style={[styles.emoji, styles.globeFace, { opacity: opacity3 }]}>
                🌏
              </Animated.Text>
            </Animated.View>
            <AppText variant="h1" style={styles.title}>
              Обери мову
            </AppText>
            <AppText variant="caption" color={colors.textMuted} style={styles.subtitle}>
              Choose your language
            </AppText>
          </View>

          <View style={styles.list}>
            {options.map((opt) => {
              const isActive = selected === opt.code;
              return (
                <Pressable
                  key={opt.code}
                  onPress={() => setSelected(opt.code)}
                  style={({ pressed }) => [
                    styles.card,
                    isActive && styles.cardActive,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <AppText style={styles.flag}>{opt.flag}</AppText>
                  <View style={styles.cardText}>
                    <AppText style={styles.cardTitle}>{opt.label}</AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      {opt.native}
                    </AppText>
                  </View>
                  <View style={[styles.radio, isActive && styles.radioActive]}>
                    {isActive ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <AppButton title="Далі / Next" size="lg" fullWidth onPress={handleContinue} />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  globeWrap: {
    width: 88,
    height: 88,
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  globeFace: {
    position: 'absolute',
  },
  emoji: {
    fontSize: 72,
    lineHeight: 88,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  list: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.card,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  flag: {
    fontSize: 40,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  footer: {
    gap: spacing.sm,
  },
});

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/AppText';
import { useAuthStore } from '@/src/stores/authStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useChildProfilesStore } from '@/src/stores/childProfilesStore';

const MIN_DURATION_MS = 2000;

export default function SplashScreen() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const authLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasChosenLanguage = useOnboardingStore((s) => s.hasChosenLanguage);
  const hasSeenWelcome = useOnboardingStore((s) => s.hasSeenWelcome);
  const onboardingHydrated = useOnboardingStore((s) => s.hydrated);
  const hasProfiles = useChildProfilesStore((s) => s.profiles.length > 0);
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  useEffect(() => {
    if (authLoading || !onboardingHydrated) return;

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, MIN_DURATION_MS - elapsed);

    const timer = setTimeout(() => {
      if (!hasChosenLanguage) {
        router.replace('/language');
      } else if (!hasSeenWelcome) {
        router.replace('/welcome');
      } else if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else {
        router.replace(hasProfiles ? '/(main)' : '/(main)/onboarding/language');
      }
    }, remaining);

    return () => clearTimeout(timer);
  }, [
    authLoading,
    onboardingHydrated,
    hasChosenLanguage,
    hasSeenWelcome,
    isAuthenticated,
    hasProfiles,
    router,
  ]);

  return (
    <LinearGradient
      colors={['#6C5CE7', '#8B7CF6', '#FF6EC7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fill}
    >
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ scale }], opacity }}>
          <AppText style={styles.logo}>🎓</AppText>
        </Animated.View>
        <Animated.View style={{ opacity }}>
          <AppText style={styles.title}>Школярик</AppText>
          <AppText style={styles.tagline}>Граємось і навчаємось</AppText>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    fontSize: 96,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.85,
    textAlign: 'center',
  },
});

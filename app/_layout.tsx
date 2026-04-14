import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/src/stores/authStore';
import { useChildProfilesStore } from '@/src/stores/childProfilesStore';
import { useAuthSession } from '@/src/hooks/useAuthSession';

export default function RootLayout() {
  useAuthSession();

  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const emailConfirmed = useAuthStore((s) => s.emailConfirmed);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasProfiles = useChildProfilesStore((s) => s.profiles.length > 0);

  useEffect(() => {
    if (isLoading) return;

    const segs = segments as unknown as string[];
    const group = segs[0];
    const inAuth = group === '(auth)';
    const inOnboarding = segs[1] === 'onboarding';
    const onConfirmScreen = segs[1] === 'email-confirmation';
    const onResetScreen = segs[1] === 'reset-password';

    if (!isAuthenticated) {
      if (!inAuth) router.replace('/(auth)/login');
      return;
    }

    if (!emailConfirmed && !onConfirmScreen && !onResetScreen) {
      router.replace('/(auth)/email-confirmation');
      return;
    }

    if (emailConfirmed && inAuth && !onResetScreen) {
      router.replace(hasProfiles ? '/(main)' : '/(main)/onboarding/language');
      return;
    }

    if (emailConfirmed && !hasProfiles && !inOnboarding && group !== '(auth)') {
      router.replace('/(main)/onboarding/language');
    }
  }, [isAuthenticated, emailConfirmed, hasProfiles, isLoading, segments, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
          <Stack.Screen name="(parent)" />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

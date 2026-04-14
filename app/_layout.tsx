import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/src/stores/authStore';
import { useChildProfilesStore } from '@/src/stores/childProfilesStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasProfiles = useChildProfilesStore((s) => s.profiles.length > 0);

  useEffect(() => {
    const segs = segments as unknown as string[];
    const group = segs[0];
    const inAuth = group === '(auth)';
    const inOnboarding = segs[1] === 'onboarding';

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
      return;
    }
    if (isAuthenticated && inAuth) {
      router.replace(hasProfiles ? '/(main)' : '/(main)/onboarding/language');
      return;
    }
    if (isAuthenticated && !hasProfiles && !inOnboarding && group !== '(auth)') {
      router.replace('/(main)/onboarding/language');
    }
  }, [isAuthenticated, hasProfiles, segments, router]);

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

import { useEffect } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { usePinStore } from '@/src/stores/pinStore';

export default function ParentLayout() {
  const router = useRouter();
  const segments = useSegments();
  const rootNavState = useRootNavigationState();
  const hasPin = usePinStore((s) => !!s.pinHash);
  const unlocked = usePinStore((s) => s.unlocked);

  useEffect(() => {
    if (!rootNavState?.key) return;

    const leaf = segments[segments.length - 1];
    if (leaf === 'pin-setup' || leaf === 'pin-gate') return;

    if (!hasPin) {
      router.replace('/(parent)/pin-setup' as never);
      return;
    }
    if (!unlocked) {
      router.replace('/(parent)/pin-gate' as never);
    }
  }, [rootNavState?.key, segments, hasPin, unlocked, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

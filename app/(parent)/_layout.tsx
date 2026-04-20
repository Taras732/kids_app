import { Stack, Redirect, useSegments } from 'expo-router';
import { usePinStore } from '@/src/stores/pinStore';

export default function ParentLayout() {
  const segments = useSegments();
  const hasPin = usePinStore((s) => !!s.pinHash);
  const unlocked = usePinStore((s) => s.unlocked);

  const leaf = segments[segments.length - 1];
  const onGateScreen = leaf === 'pin-setup' || leaf === 'pin-gate';

  if (!onGateScreen) {
    if (!hasPin) return <Redirect href={'/(parent)/pin-setup' as never} />;
    if (!unlocked) return <Redirect href={'/(parent)/pin-gate' as never} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

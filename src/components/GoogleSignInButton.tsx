import { Pressable, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from './AppText';

const GOOGLE_G_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

const encodeDataUri = (svg: string): string => {
  const base64 =
    typeof btoa !== 'undefined'
      ? btoa(svg)
      : // eslint-disable-next-line @typescript-eslint/no-require-imports
        Buffer.from(svg, 'utf-8').toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

const GOOGLE_G_URI = encodeDataUri(GOOGLE_G_SVG);

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function GoogleSignInButton({
  onPress,
  loading = false,
  disabled = false,
  label = 'Увійти з Google',
}: GoogleSignInButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        pressed && !isDisabled && styles.btnPressed,
        isDisabled && styles.btnDisabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color="#3C4043" />
      ) : (
        <>
          <View style={styles.iconWrap}>
            <Image source={{ uri: GOOGLE_G_URI }} style={styles.icon} contentFit="contain" />
          </View>
          <AppText style={styles.label}>{label}</AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DADCE0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  btnPressed: {
    backgroundColor: '#F8F9FA',
    borderColor: '#D2E3FC',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 18,
    height: 18,
  },
  icon: {
    width: 18,
    height: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C4043',
    letterSpacing: 0.25,
  },
});

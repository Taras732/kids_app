import { View, StyleSheet } from 'react-native';

export type ShapeId = 'circle' | 'square' | 'triangle' | 'rectangle';

interface ShapeViewProps {
  shape: ShapeId;
  color: string;
  size: number;
}

export function ShapeView({ shape, color, size }: ShapeViewProps) {
  if (shape === 'circle') {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    );
  }

  if (shape === 'square') {
    return (
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: 4,
        }}
      />
    );
  }

  if (shape === 'rectangle') {
    const width = size;
    const height = size * (2 / 3);
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: color,
          borderRadius: 4,
        }}
      />
    );
  }

  const base = size;
  const height = base * 0.866;
  return (
    <View
      style={[
        styles.triangle,
        {
          borderLeftWidth: base / 2,
          borderRightWidth: base / 2,
          borderBottomWidth: height,
          borderBottomColor: color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  triangle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    backgroundColor: 'transparent',
  },
});

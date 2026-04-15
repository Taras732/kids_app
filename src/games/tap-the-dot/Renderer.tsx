import { useRef, useState } from 'react';
import { View, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { colors, radius } from '../../constants/theme';
import type { RendererProps } from '../types';

export interface DotPayload {
  xFrac: number;
  yFrac: number;
  radius: number;
}

export interface DotAnswer {
  x: number;
  y: number;
  fieldW: number;
  fieldH: number;
}

export function Renderer({ task, onAnswer, disabled }: RendererProps<DotAnswer>) {
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const fieldRef = useRef<View | null>(null);
  const payload = task.payload as DotPayload;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
    requestAnimationFrame(() => {
      fieldRef.current?.measureInWindow?.((px, py) => {
        offsetRef.current = { x: px, y: py };
      });
    });
  };

  const dotCenterX = payload.xFrac * size.w;
  const dotCenterY = payload.yFrac * size.h;
  const dotLeft = dotCenterX - payload.radius;
  const dotTop = dotCenterY - payload.radius;

  return (
    <Pressable
      ref={fieldRef as any}
      style={styles.field}
      onLayout={onLayout}
      onPress={(e) => {
        if (disabled || size.w === 0) return;
        const ne = e.nativeEvent as any;
        const pageX: number = ne.pageX ?? ne.locationX ?? 0;
        const pageY: number = ne.pageY ?? ne.locationY ?? 0;
        const off = offsetRef.current;
        const localX = pageX - off.x;
        const localY = pageY - off.y;
        onAnswer({ x: localX, y: localY, fieldW: size.w, fieldH: size.h });
      }}
    >
      {size.w > 0 ? (
        <View
          pointerEvents="none"
          style={[
            styles.dot,
            {
              left: dotLeft,
              top: dotTop,
              width: payload.radius * 2,
              height: payload.radius * 2,
              borderRadius: payload.radius,
            },
          ]}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    overflow: 'hidden',
    margin: 16,
  },
  dot: {
    position: 'absolute',
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

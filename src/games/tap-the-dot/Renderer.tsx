import { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet, Animated, type LayoutChangeEvent } from 'react-native';
import { colors, radius } from '../../constants/theme';
import type { RendererProps } from '../types';

export interface DotPayload {
  startXFrac: number;
  startYFrac: number;
  angleRad: number;
  radius: number;
  speed: number;
}

export interface DotAnswer {
  tapX: number;
  tapY: number;
  dotX: number;
  dotY: number;
  radius: number;
}

export function Renderer({ task, onAnswer, disabled }: RendererProps<DotAnswer>) {
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const fieldRef = useRef<View | null>(null);
  const payload = task.payload as DotPayload;

  const posX = useRef(new Animated.Value(0)).current;
  const posY = useRef(new Animated.Value(0)).current;

  const motionRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
    requestAnimationFrame(() => {
      fieldRef.current?.measureInWindow?.((px, py) => {
        offsetRef.current = { x: px, y: py };
      });
    });
  };

  useEffect(() => {
    if (size.w === 0 || size.h === 0) return;

    const r = payload.radius;
    const cx = payload.startXFrac * size.w;
    const cy = payload.startYFrac * size.h;
    const vx = Math.cos(payload.angleRad) * payload.speed;
    const vy = Math.sin(payload.angleRad) * payload.speed;

    motionRef.current = { x: cx, y: cy, vx, vy };
    posX.setValue(cx - r);
    posY.setValue(cy - r);

    if (payload.speed === 0) return;

    let rafId = 0;
    let last = performance.now();
    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const m = motionRef.current;
      let { x, y, vx: cvx, vy: cvy } = m;
      x += cvx * dt;
      y += cvy * dt;

      const minX = r;
      const maxX = size.w - r;
      const minY = r;
      const maxY = size.h - r;

      if (x < minX) {
        x = minX + (minX - x);
        cvx = Math.abs(cvx);
      } else if (x > maxX) {
        x = maxX - (x - maxX);
        cvx = -Math.abs(cvx);
      }
      if (y < minY) {
        y = minY + (minY - y);
        cvy = Math.abs(cvy);
      } else if (y > maxY) {
        y = maxY - (y - maxY);
        cvy = -Math.abs(cvy);
      }

      motionRef.current = { x, y, vx: cvx, vy: cvy };
      posX.setValue(x - r);
      posY.setValue(y - r);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [size.w, size.h, payload.startXFrac, payload.startYFrac, payload.angleRad, payload.radius, payload.speed, posX, posY]);

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
        const m = motionRef.current;
        onAnswer({
          tapX: localX,
          tapY: localY,
          dotX: m.x,
          dotY: m.y,
          radius: payload.radius,
        });
      }}
    >
      {size.w > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.dot,
            {
              width: payload.radius * 2,
              height: payload.radius * 2,
              borderRadius: payload.radius,
              transform: [{ translateX: posX }, { translateY: posY }],
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
    left: 0,
    top: 0,
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

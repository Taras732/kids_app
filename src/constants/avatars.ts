export const AVATARS = ['🦁', '🐻', '🦄', '🐸', '🐵', '🐧'] as const;
export type AvatarId = (typeof AVATARS)[number];

import { persistentAtom } from '@nanostores/persistent';

export type Theme = 'light' | 'dark' | 'system';

export const theme = persistentAtom<Theme>('at75:theme', 'system');

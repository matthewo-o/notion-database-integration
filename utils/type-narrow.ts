export type Extract<T, N> = T extends { type: N } ? T : never

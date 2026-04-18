// src/lib/types/generic.ts
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
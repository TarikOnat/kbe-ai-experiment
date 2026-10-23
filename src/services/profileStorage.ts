import { createDemoProfile } from '@/data/catalog'
import type { StudentProfile } from '@/types/profile'

export const STORAGE_KEY = 'htw-portal.student-profile.v1'

/** Simulierte Netzwerklatenz, damit Lade-/Speicherzustände in der UI sichtbar sind. */
const SIMULATED_LATENCY_MS = 600

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Übernimmt nur Felder, deren Typ zum Default passt. So führen manipulierte
 * oder veraltete Einträge im localStorage nicht zu einem kaputten Zustand.
 */
function mergeKnownFields<T extends object>(defaults: T, stored: unknown): T {
  if (!isRecord(stored)) return defaults
  const result = { ...defaults }
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const value = stored[key as string]
    if (typeof value === typeof defaults[key]) result[key] = value as T[keyof T]
  }
  return result
}

/** Tiefe Kopie – funktioniert (anders als structuredClone) auch mit reaktiven Vue-Proxys. */
export function cloneProfile(profile: StudentProfile): StudentProfile {
  return JSON.parse(JSON.stringify(profile)) as StudentProfile
}

export function parseStoredProfile(raw: string | null): StudentProfile {
  const defaults = createDemoProfile()
  if (!raw) return defaults
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return defaults
    return {
      personal: mergeKnownFields(defaults.personal, parsed.personal),
      study: mergeKnownFields(defaults.study, parsed.study),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
    }
  } catch {
    return defaults
  }
}

export async function loadProfile(): Promise<StudentProfile> {
  await delay(SIMULATED_LATENCY_MS / 2)
  return parseStoredProfile(localStorage.getItem(STORAGE_KEY))
}

export async function saveProfile(profile: StudentProfile): Promise<StudentProfile> {
  await delay(SIMULATED_LATENCY_MS)
  const saved: StudentProfile = { ...cloneProfile(profile), updatedAt: new Date().toISOString() }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  } catch {
    throw new Error('Die Daten konnten nicht gespeichert werden. Bitte versuchen Sie es später erneut.')
  }
  return saved
}

export function clearStoredProfile(): void {
  localStorage.removeItem(STORAGE_KEY)
}

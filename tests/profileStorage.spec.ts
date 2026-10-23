import { describe, expect, it } from 'vitest'
import { createDemoProfile } from '@/data/catalog'
import { parseStoredProfile } from '@/services/profileStorage'

describe('parseStoredProfile', () => {
  it('liefert Demo-Daten, wenn nichts gespeichert ist', () => {
    expect(parseStoredProfile(null)).toEqual(createDemoProfile())
  })

  it('fällt bei kaputtem JSON auf Demo-Daten zurück', () => {
    expect(parseStoredProfile('{kaputt')).toEqual(createDemoProfile())
    expect(parseStoredProfile('[]')).toEqual(createDemoProfile())
  })

  it('übernimmt gespeicherte Werte und ignoriert Felder mit falschem Typ', () => {
    const stored = createDemoProfile()
    stored.personal.vorname = 'Max'
    const raw = JSON.parse(JSON.stringify(stored))
    raw.study.fachsemester = 'drei'
    raw.study.unbekannt = 'x'
    raw.updatedAt = '2026-10-01T10:00:00.000Z'

    const result = parseStoredProfile(JSON.stringify(raw))
    expect(result.personal.vorname).toBe('Max')
    expect(result.study.fachsemester).toBe(createDemoProfile().study.fachsemester)
    expect(result.study).not.toHaveProperty('unbekannt')
    expect(result.updatedAt).toBe('2026-10-01T10:00:00.000Z')
  })
})

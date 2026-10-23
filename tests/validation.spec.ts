import { describe, expect, it } from 'vitest'
import { buildSemesterOptions, createDemoProfile } from '@/data/catalog'
import { calculateAge, parseIsoDate, validateProfile } from '@/utils/validation'

const TODAY = new Date(2026, 9, 23) // 23.10.2026

describe('parseIsoDate', () => {
  it('akzeptiert gültige Daten', () => {
    expect(parseIsoDate('2002-05-14')?.getDate()).toBe(14)
  })

  it('lehnt ungültige Kalendertage und Formate ab', () => {
    expect(parseIsoDate('2023-02-30')).toBeNull()
    expect(parseIsoDate('14.05.2002')).toBeNull()
    expect(parseIsoDate('')).toBeNull()
  })
})

describe('calculateAge', () => {
  it('berücksichtigt, ob der Geburtstag schon war', () => {
    expect(calculateAge(new Date(2000, 9, 23), TODAY)).toBe(26)
    expect(calculateAge(new Date(2000, 9, 24), TODAY)).toBe(25)
  })
})

describe('validateProfile', () => {
  it('akzeptiert den Demo-Datensatz', () => {
    expect(validateProfile(createDemoProfile(), TODAY)).toEqual({})
  })

  it('meldet fehlende Pflichtfelder', () => {
    const p = createDemoProfile()
    p.personal.vorname = '  '
    p.personal.privateEmail = ''
    p.personal.ort = ''
    const errors = validateProfile(p, TODAY)
    expect(errors['personal.vorname']).toMatch(/Pflichtfeld/)
    expect(errors['personal.privateEmail']).toMatch(/Pflichtfeld/)
    expect(errors['personal.ort']).toMatch(/Pflichtfeld/)
  })

  it('erlaubt Umlaute, Bindestriche und Apostrophe in Namen', () => {
    const p = createDemoProfile()
    p.personal.vorname = 'Zoë-Marie'
    p.personal.nachname = "O'Brien Müller"
    expect(validateProfile(p, TODAY)).toEqual({})
  })

  it('lehnt Ziffern in Namen ab', () => {
    const p = createDemoProfile()
    p.personal.nachname = 'Schneider2'
    expect(validateProfile(p, TODAY)['personal.nachname']).toBeDefined()
  })

  it('prüft E-Mail-Format und verbietet die Hochschuladresse', () => {
    const p = createDemoProfile()
    p.personal.privateEmail = 'kein-at-zeichen.de'
    expect(validateProfile(p, TODAY)['personal.privateEmail']).toMatch(/gültige/)
    p.personal.privateEmail = 's0587412@HTW-Berlin.de'
    expect(validateProfile(p, TODAY)['personal.privateEmail']).toMatch(/private Adresse/)
  })

  it('prüft das Geburtsdatum auf Zukunft und Mindestalter', () => {
    const p = createDemoProfile()
    p.personal.geburtsdatum = '2030-01-01'
    expect(validateProfile(p, TODAY)['personal.geburtsdatum']).toMatch(/Zukunft/)
    p.personal.geburtsdatum = '2015-01-01'
    expect(validateProfile(p, TODAY)['personal.geburtsdatum']).toMatch(/mindestens 16/)
  })

  it('verlangt eine 5-stellige PLZ nur für Deutschland', () => {
    const p = createDemoProfile()
    p.personal.plz = '1031'
    expect(validateProfile(p, TODAY)['personal.plz']).toMatch(/5 Ziffern/)
    p.personal.land = 'Österreich'
    expect(validateProfile(p, TODAY)['personal.plz']).toBeUndefined()
  })

  it('verlangt eine Hausnummer', () => {
    const p = createDemoProfile()
    p.personal.strasse = 'Treskowallee'
    expect(validateProfile(p, TODAY)['personal.strasse']).toMatch(/Hausnummer/)
  })

  it('prüft das Fachsemester', () => {
    const p = createDemoProfile()
    for (const invalid of [0, 21, 2.5, Number.NaN]) {
      p.study.fachsemester = invalid
      expect(validateProfile(p, TODAY)['study.fachsemester']).toBeDefined()
    }
  })

  it('lehnt unbekannte Studiengänge ab', () => {
    const p = createDemoProfile()
    p.study.studiengangId = 'gibt-es-nicht'
    expect(validateProfile(p, TODAY)['study.studiengangId']).toBeDefined()
  })
})

describe('buildSemesterOptions', () => {
  it('enthält das aktuelle Wintersemester ab Oktober, aber kein zukünftiges', () => {
    const options = buildSemesterOptions(TODAY, 2)
    expect(options[0]).toBe('WiSe 2026/27')
    expect(options).toContain('SoSe 2026')
    expect(options).not.toContain('SoSe 2027')
  })

  it('enthält vor April noch kein Sommersemester des laufenden Jahres', () => {
    const options = buildSemesterOptions(new Date(2026, 1, 1), 1)
    expect(options[0]).toBe('WiSe 2025/26')
    expect(options).not.toContain('SoSe 2026')
  })

  it('formatiert den Jahreswechsel 2099/00 korrekt', () => {
    expect(buildSemesterOptions(new Date(2099, 10, 1), 0)).toContain('WiSe 2099/00')
  })
})

import type { Anrede, ImmatrikulationsStatus, Studiengang, StudentProfile } from '@/types/profile'

export const FACHBEREICHE = {
  FB1: 'FB 1 – Ingenieurwissenschaften – Energie und Information',
  FB2: 'FB 2 – Ingenieurwissenschaften – Technik und Leben',
  FB3: 'FB 3 – Wirtschafts- und Rechtswissenschaften',
  FB4: 'FB 4 – Informatik, Kommunikation und Wirtschaft',
  FB5: 'FB 5 – Gestaltung und Kultur',
} as const

export const STUDIENGAENGE: Studiengang[] = [
  { id: 'ai-bsc', name: 'Angewandte Informatik', abschluss: 'Bachelor of Science', fachbereich: FACHBEREICHE.FB4, regelstudienzeit: 7 },
  { id: 'ai-msc', name: 'Angewandte Informatik', abschluss: 'Master of Science', fachbereich: FACHBEREICHE.FB4, regelstudienzeit: 3 },
  { id: 'wi-bsc', name: 'Wirtschaftsinformatik', abschluss: 'Bachelor of Science', fachbereich: FACHBEREICHE.FB4, regelstudienzeit: 7 },
  { id: 'imi-bsc', name: 'Internationale Medieninformatik', abschluss: 'Bachelor of Science', fachbereich: FACHBEREICHE.FB4, regelstudienzeit: 7 },
  { id: 'ikg-bsc', name: 'Informatik in Kultur und Gesundheit', abschluss: 'Bachelor of Science', fachbereich: FACHBEREICHE.FB4, regelstudienzeit: 7 },
  { id: 'et-beng', name: 'Elektrotechnik', abschluss: 'Bachelor of Engineering', fachbereich: FACHBEREICHE.FB1, regelstudienzeit: 7 },
  { id: 'mb-beng', name: 'Maschinenbau', abschluss: 'Bachelor of Engineering', fachbereich: FACHBEREICHE.FB2, regelstudienzeit: 7 },
  { id: 'bwl-bsc', name: 'Betriebswirtschaftslehre', abschluss: 'Bachelor of Science', fachbereich: FACHBEREICHE.FB3, regelstudienzeit: 6 },
  { id: 'kd-ba', name: 'Kommunikationsdesign', abschluss: 'Bachelor of Arts', fachbereich: FACHBEREICHE.FB5, regelstudienzeit: 7 },
]

export const ANREDEN: Anrede[] = ['Frau', 'Herr', 'Divers', 'Keine Angabe']

export const STATUS_LABELS: Record<ImmatrikulationsStatus, string> = {
  immatrikuliert: 'Immatrikuliert',
  beurlaubt: 'Beurlaubt',
  exmatrikuliert: 'Exmatrikuliert',
}

export const LAENDER = [
  'Deutschland',
  'Österreich',
  'Schweiz',
  'Frankreich',
  'Italien',
  'Niederlande',
  'Polen',
  'Spanien',
  'Türkei',
  'Vereinigtes Königreich',
  'Vereinigte Staaten',
  'Anderes Land',
]

export const STAATSANGEHOERIGKEITEN = [
  'deutsch',
  'österreichisch',
  'schweizerisch',
  'französisch',
  'italienisch',
  'niederländisch',
  'polnisch',
  'spanisch',
  'türkisch',
  'britisch',
  'US-amerikanisch',
  'andere',
]

export function findStudiengang(id: string): Studiengang | undefined {
  return STUDIENGAENGE.find((s) => s.id === id)
}

/**
 * Liefert die wählbaren Semester (Sommer-/Wintersemester) der letzten Jahre
 * bis einschließlich des aktuellen Semesters – neueste zuerst.
 */
export function buildSemesterOptions(today: Date = new Date(), yearsBack = 10): string[] {
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const options: string[] = []
  for (let y = year; y >= year - yearsBack; y--) {
    // Wintersemester beginnt im Oktober
    if (y < year || month >= 10) options.push(`WiSe ${y}/${String((y + 1) % 100).padStart(2, '0')}`)
    // Sommersemester beginnt im April
    if (y < year || month >= 4) options.push(`SoSe ${y}`)
  }
  return options
}

/** Fiktiver Demo-Datensatz, mit dem das Portal initial befüllt wird. */
export function createDemoProfile(): StudentProfile {
  return {
    personal: {
      anrede: 'Frau',
      titel: '',
      vorname: 'Lena',
      nachname: 'Schneider',
      geburtsdatum: '2002-05-14',
      geburtsort: 'Potsdam',
      staatsangehoerigkeit: 'deutsch',
      privateEmail: 'lena.schneider@example.org',
      telefon: '+49 30 1234567',
      strasse: 'Treskowallee 8',
      plz: '10318',
      ort: 'Berlin',
      land: 'Deutschland',
    },
    study: {
      matrikelnummer: '0587412',
      hochschulEmail: 's0587412@htw-berlin.de',
      status: 'immatrikuliert',
      studiengangId: 'ai-bsc',
      fachsemester: 5,
      studienbeginn: 'WiSe 2024/25',
      schwerpunkt: 'Softwareentwicklung',
    },
    updatedAt: null,
  }
}

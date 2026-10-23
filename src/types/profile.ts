export type Anrede = 'Frau' | 'Herr' | 'Divers' | 'Keine Angabe'

export type ImmatrikulationsStatus = 'immatrikuliert' | 'beurlaubt' | 'exmatrikuliert'

export interface PersonalData {
  anrede: Anrede
  titel: string
  vorname: string
  nachname: string
  geburtsdatum: string // ISO-Datum (YYYY-MM-DD)
  geburtsort: string
  staatsangehoerigkeit: string
  privateEmail: string
  telefon: string
  strasse: string
  plz: string
  ort: string
  land: string
}

export interface StudyData {
  /** Wird von der Hochschulverwaltung vergeben – nicht editierbar. */
  matrikelnummer: string
  /** Wird von der Hochschulverwaltung vergeben – nicht editierbar. */
  hochschulEmail: string
  /** Wird von der Hochschulverwaltung geführt – nicht editierbar. */
  status: ImmatrikulationsStatus
  studiengangId: string
  fachsemester: number
  studienbeginn: string
  schwerpunkt: string
}

export interface StudentProfile {
  personal: PersonalData
  study: StudyData
  /** ISO-Zeitstempel der letzten Speicherung, null wenn nie gespeichert. */
  updatedAt: string | null
}

export interface Studiengang {
  id: string
  name: string
  abschluss: string
  fachbereich: string
  regelstudienzeit: number
}

/** Fehlermeldungen je Feldpfad, z. B. "personal.vorname". */
export type ValidationErrors = Record<string, string>

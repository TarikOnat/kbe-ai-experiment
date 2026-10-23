import { findStudiengang } from '@/data/catalog'
import type { PersonalData, StudentProfile, StudyData, ValidationErrors } from '@/types/profile'

const NAME_PATTERN = /^[\p{L}][\p{L}' .-]*$/u
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_PATTERN = /^\+?[0-9][0-9 ()/-]{4,22}$/
const PLZ_DE_PATTERN = /^\d{5}$/
const PLZ_INTL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/

export const MIN_AGE = 16
export const MAX_AGE = 100

/** Parst ein ISO-Datum (YYYY-MM-DD) streng – ungültige Tage wie 2023-02-30 ergeben null. */
export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, y, m, d] = match.map(Number) as [number, number, number, number]
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null
  return date
}

export function calculateAge(birthDate: Date, today: Date = new Date()): number {
  let age = today.getFullYear() - birthDate.getFullYear()
  const hadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  if (!hadBirthday) age--
  return age
}

function validateName(value: string, label: string, required: boolean): string | null {
  const v = value.trim()
  if (!v) return required ? `${label} ist ein Pflichtfeld.` : null
  if (v.length < 2) return `${label} muss mindestens 2 Zeichen lang sein.`
  if (v.length > 50) return `${label} darf höchstens 50 Zeichen lang sein.`
  if (!NAME_PATTERN.test(v)) return `${label} darf nur Buchstaben, Leerzeichen, Bindestriche und Apostrophe enthalten.`
  return null
}

export function validatePersonal(p: PersonalData, today: Date = new Date()): ValidationErrors {
  const errors: ValidationErrors = {}
  const set = (field: keyof PersonalData, msg: string | null) => {
    if (msg) errors[`personal.${field}`] = msg
  }

  set('vorname', validateName(p.vorname, 'Vorname', true))
  set('nachname', validateName(p.nachname, 'Nachname', true))
  set('geburtsort', validateName(p.geburtsort, 'Geburtsort', false))
  if (p.titel.trim().length > 30) set('titel', 'Titel darf höchstens 30 Zeichen lang sein.')

  if (!p.geburtsdatum) {
    set('geburtsdatum', 'Geburtsdatum ist ein Pflichtfeld.')
  } else {
    const date = parseIsoDate(p.geburtsdatum)
    if (!date) set('geburtsdatum', 'Bitte ein gültiges Datum eingeben.')
    else if (date > today) set('geburtsdatum', 'Das Geburtsdatum darf nicht in der Zukunft liegen.')
    else {
      const age = calculateAge(date, today)
      if (age < MIN_AGE) set('geburtsdatum', `Studierende müssen mindestens ${MIN_AGE} Jahre alt sein.`)
      else if (age > MAX_AGE) set('geburtsdatum', 'Bitte ein plausibles Geburtsdatum eingeben.')
    }
  }

  const email = p.privateEmail.trim()
  if (!email) set('privateEmail', 'Private E-Mail-Adresse ist ein Pflichtfeld.')
  else if (email.length > 254 || !EMAIL_PATTERN.test(email)) set('privateEmail', 'Bitte eine gültige E-Mail-Adresse eingeben (z. B. name@example.org).')
  else if (/@htw-berlin\.de$/i.test(email)) set('privateEmail', 'Bitte eine private Adresse angeben – die Hochschuladresse ist bereits hinterlegt.')

  const phone = p.telefon.trim()
  if (phone && !PHONE_PATTERN.test(phone)) set('telefon', 'Bitte eine gültige Telefonnummer eingeben (z. B. +49 30 1234567).')

  const strasse = p.strasse.trim()
  if (!strasse) set('strasse', 'Straße und Hausnummer sind Pflichtfelder.')
  else if (strasse.length > 100) set('strasse', 'Straße darf höchstens 100 Zeichen lang sein.')
  else if (!/\d/.test(strasse)) set('strasse', 'Bitte auch die Hausnummer angeben.')

  const plz = p.plz.trim()
  if (!plz) set('plz', 'PLZ ist ein Pflichtfeld.')
  else if (p.land === 'Deutschland' && !PLZ_DE_PATTERN.test(plz)) set('plz', 'Eine deutsche PLZ besteht aus genau 5 Ziffern.')
  else if (p.land !== 'Deutschland' && !PLZ_INTL_PATTERN.test(plz)) set('plz', 'Bitte eine gültige Postleitzahl eingeben.')

  set('ort', validateName(p.ort, 'Ort', true))
  if (!p.land) set('land', 'Land ist ein Pflichtfeld.')
  if (!p.staatsangehoerigkeit) set('staatsangehoerigkeit', 'Staatsangehörigkeit ist ein Pflichtfeld.')

  return errors
}

export function validateStudy(s: StudyData): ValidationErrors {
  const errors: ValidationErrors = {}
  const studiengang = findStudiengang(s.studiengangId)

  if (!studiengang) errors['study.studiengangId'] = 'Bitte einen Studiengang auswählen.'

  if (!Number.isInteger(s.fachsemester) || s.fachsemester < 1) {
    errors['study.fachsemester'] = 'Das Fachsemester muss eine ganze Zahl ab 1 sein.'
  } else if (s.fachsemester > 20) {
    errors['study.fachsemester'] = 'Das Fachsemester darf höchstens 20 betragen.'
  }

  if (!s.studienbeginn) errors['study.studienbeginn'] = 'Bitte den Studienbeginn auswählen.'
  if (s.schwerpunkt.trim().length > 80) errors['study.schwerpunkt'] = 'Schwerpunkt darf höchstens 80 Zeichen lang sein.'

  return errors
}

export function validateProfile(profile: StudentProfile, today: Date = new Date()): ValidationErrors {
  return { ...validatePersonal(profile.personal, today), ...validateStudy(profile.study) }
}

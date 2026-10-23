import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createProfileStore } from '@/composables/useProfile'
import { STORAGE_KEY } from '@/services/profileStorage'

async function createLoadedStore() {
  const store = createProfileStore()
  const loading = store.load()
  await vi.runAllTimersAsync()
  await loading
  return store
}

async function saveAndFlush(store: ReturnType<typeof createProfileStore>) {
  const saving = store.save()
  await vi.runAllTimersAsync()
  return saving
}

describe('Profil-Store', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('lädt Demo-Daten und startet im Lesemodus', async () => {
    const store = await createLoadedStore()
    expect(store.isLoading.value).toBe(false)
    expect(store.isEditing.value).toBe(false)
    expect(store.current.value?.personal.vorname).toBe('Lena')
  })

  it('verändert gespeicherte Daten erst beim Speichern', async () => {
    const store = await createLoadedStore()
    store.startEditing()
    store.draft.value!.personal.vorname = 'Mia'
    expect(store.isDirty.value).toBe(true)
    expect(store.saved.value!.personal.vorname).toBe('Lena')

    expect(await saveAndFlush(store)).toBe(true)
    expect(store.isEditing.value).toBe(false)
    expect(store.saved.value!.personal.vorname).toBe('Mia')
    expect(store.saved.value!.updatedAt).not.toBeNull()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).personal.vorname).toBe('Mia')
  })

  it('verwirft Änderungen beim Abbrechen', async () => {
    const store = await createLoadedStore()
    store.startEditing()
    store.draft.value!.personal.ort = 'Hamburg'
    store.cancelEditing()
    expect(store.current.value!.personal.ort).toBe('Berlin')
    expect(store.isDirty.value).toBe(false)
  })

  it('speichert nicht bei Validierungsfehlern und zeigt dann alle Fehler', async () => {
    const store = await createLoadedStore()
    store.startEditing()
    store.draft.value!.personal.nachname = ''
    expect(store.visibleErrors.value).toEqual({})

    expect(await saveAndFlush(store)).toBe(false)
    expect(store.isEditing.value).toBe(true)
    expect(store.visibleErrors.value['personal.nachname']).toBeDefined()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('zeigt Fehler nach Verlassen eines Feldes an', async () => {
    const store = await createLoadedStore()
    store.startEditing()
    store.draft.value!.personal.plz = 'abc'
    store.markTouched('personal.plz')
    expect(Object.keys(store.visibleErrors.value)).toEqual(['personal.plz'])
  })

  it('trimmt Eingaben und schützt Verwaltungsfelder', async () => {
    const store = await createLoadedStore()
    store.startEditing()
    store.draft.value!.personal.vorname = '  Mia  '
    store.draft.value!.study.matrikelnummer = '9999999'
    store.draft.value!.study.status = 'exmatrikuliert'

    expect(await saveAndFlush(store)).toBe(true)
    expect(store.saved.value!.personal.vorname).toBe('Mia')
    expect(store.saved.value!.study.matrikelnummer).toBe('0587412')
    expect(store.saved.value!.study.status).toBe('immatrikuliert')
  })

  it('stellt nach dem Zurücksetzen die Demo-Daten wieder her', async () => {
    const store = await createLoadedStore()
    store.startEditing()
    store.draft.value!.personal.vorname = 'Mia'
    await saveAndFlush(store)

    const resetting = store.resetToDemo()
    await vi.runAllTimersAsync()
    await resetting
    expect(store.saved.value!.personal.vorname).toBe('Lena')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

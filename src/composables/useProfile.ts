import { computed, reactive, ref } from 'vue'
import { clearStoredProfile, cloneProfile, loadProfile, saveProfile } from '@/services/profileStorage'
import type { StudentProfile, ValidationErrors } from '@/types/profile'
import { validateProfile } from '@/utils/validation'

/** Entfernt führende/abschließende Leerzeichen aus allen Textfeldern. */
function trimStrings<T extends object>(obj: T): T {
  const result = { ...obj }
  for (const key of Object.keys(result) as (keyof T)[]) {
    const value = result[key]
    if (typeof value === 'string') result[key] = value.trim() as T[keyof T]
  }
  return result
}

export type ProfileStore = ReturnType<typeof createProfileStore>

let sharedStore: ProfileStore | null = null

/** Liefert den app-weit geteilten Profilzustand (Header, Seite und Footer greifen darauf zu). */
export function useProfile(): ProfileStore {
  sharedStore ??= createProfileStore()
  return sharedStore
}

export function createProfileStore() {
  const saved = ref<StudentProfile | null>(null)
  const draft = ref<StudentProfile | null>(null)
  const isLoading = ref(true)
  const isSaving = ref(false)
  const isEditing = ref(false)
  const loadError = ref<string | null>(null)
  const submitAttempted = ref(false)
  const touched = reactive(new Set<string>())

  const errors = computed<ValidationErrors>(() => (draft.value ? validateProfile(draft.value) : {}))

  /** Fehler werden erst angezeigt, wenn das Feld verlassen oder Speichern versucht wurde. */
  const visibleErrors = computed<ValidationErrors>(() => {
    if (submitAttempted.value) return errors.value
    return Object.fromEntries(Object.entries(errors.value).filter(([path]) => touched.has(path)))
  })

  const isDirty = computed(() => {
    if (!saved.value || !draft.value) return false
    return JSON.stringify(saved.value) !== JSON.stringify(draft.value)
  })

  /** Im Lesemodus wird immer der gespeicherte Stand angezeigt. */
  const current = computed(() => (isEditing.value ? draft.value : saved.value))

  async function load() {
    isLoading.value = true
    loadError.value = null
    try {
      const profile = await loadProfile()
      saved.value = profile
      draft.value = cloneProfile(profile)
    } catch {
      loadError.value = 'Das Profil konnte nicht geladen werden.'
    } finally {
      isLoading.value = false
    }
  }

  function resetValidationState() {
    submitAttempted.value = false
    touched.clear()
  }

  function startEditing() {
    if (!saved.value) return
    draft.value = cloneProfile(saved.value)
    resetValidationState()
    isEditing.value = true
  }

  function cancelEditing() {
    if (saved.value) draft.value = cloneProfile(saved.value)
    resetValidationState()
    isEditing.value = false
  }

  function markTouched(path: string) {
    touched.add(path)
  }

  /** Speichert den Entwurf. Gibt `true` bei Erfolg zurück, wirft bei technischen Fehlern. */
  async function save(): Promise<boolean> {
    if (!draft.value || !saved.value || isSaving.value) return false
    submitAttempted.value = true
    if (Object.keys(errors.value).length > 0) return false

    const { matrikelnummer, hochschulEmail, status } = saved.value.study
    const toSave: StudentProfile = {
      personal: trimStrings(draft.value.personal),
      // Verwaltungsfelder dürfen clientseitig nicht überschrieben werden.
      study: { ...trimStrings(draft.value.study), matrikelnummer, hochschulEmail, status },
      updatedAt: saved.value.updatedAt,
    }

    isSaving.value = true
    try {
      const result = await saveProfile(toSave)
      saved.value = result
      draft.value = cloneProfile(result)
      resetValidationState()
      isEditing.value = false
      return true
    } finally {
      isSaving.value = false
    }
  }

  async function resetToDemo() {
    clearStoredProfile()
    isEditing.value = false
    resetValidationState()
    await load()
  }

  return {
    saved,
    draft,
    current,
    isLoading,
    isSaving,
    isEditing,
    isDirty,
    loadError,
    errors,
    visibleErrors,
    load,
    startEditing,
    cancelEditing,
    markTouched,
    save,
    resetToDemo,
  }
}

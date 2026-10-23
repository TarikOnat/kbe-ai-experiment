<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseIcon from '@/components/BaseIcon.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import FormField from '@/components/FormField.vue'
import ProfileSection from '@/components/ProfileSection.vue'
import ProfileSummary from '@/components/ProfileSummary.vue'
import { useProfile } from '@/composables/useProfile'
import { useToasts } from '@/composables/useToasts'
import {
  ANREDEN,
  LAENDER,
  STAATSANGEHOERIGKEITEN,
  STATUS_LABELS,
  STUDIENGAENGE,
  buildSemesterOptions,
  findStudiengang,
} from '@/data/catalog'

const {
  saved,
  current,
  isLoading,
  isSaving,
  isEditing,
  isDirty,
  loadError,
  visibleErrors,
  load,
  startEditing,
  cancelEditing,
  markTouched,
  save,
} = useProfile()
const { show: showToast } = useToasts()

const showDiscardDialog = ref(false)
const errorSummary = ref<HTMLElement | null>(null)

const studiengangOptions = STUDIENGAENGE.map((s) => ({ value: s.id, label: `${s.name} (${s.abschluss})` }))
const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))
const semesterOptions = computed(() => {
  const options = buildSemesterOptions()
  // Gespeicherten Wert immer anbieten, auch wenn er außerhalb des Zeitfensters liegt
  const stored = current.value?.study.studienbeginn
  if (stored && !options.includes(stored)) options.push(stored)
  return options
})

const studiengang = computed(() => (current.value ? findStudiengang(current.value.study.studiengangId) : undefined))
const errorList = computed(() => Object.entries(visibleErrors.value))

/** "personal.vorname" -> "personal-vorname" (DOM-ID des Eingabefelds) */
const fieldId = (path: string) => path.replace('.', '-')
const err = (path: string) => visibleErrors.value[path]

const fieldLabels: Record<string, string> = {
  'personal.titel': 'Titel',
  'personal.vorname': 'Vorname',
  'personal.nachname': 'Nachname',
  'personal.geburtsdatum': 'Geburtsdatum',
  'personal.geburtsort': 'Geburtsort',
  'personal.staatsangehoerigkeit': 'Staatsangehörigkeit',
  'personal.privateEmail': 'Private E-Mail',
  'personal.telefon': 'Telefon',
  'personal.strasse': 'Straße und Hausnummer',
  'personal.plz': 'PLZ',
  'personal.ort': 'Ort',
  'personal.land': 'Land',
  'study.studiengangId': 'Studiengang',
  'study.fachsemester': 'Fachsemester',
  'study.studienbeginn': 'Studienbeginn',
  'study.schwerpunkt': 'Schwerpunkt',
}

function focusField(path: string) {
  const el = document.getElementById(fieldId(path))
  el?.focus()
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function onEdit() {
  startEditing()
  nextTick(() => document.getElementById('personal-vorname')?.focus())
}

function onCancel() {
  if (isSaving.value) return
  if (isDirty.value) showDiscardDialog.value = true
  else cancelEditing()
}

function confirmDiscard() {
  showDiscardDialog.value = false
  cancelEditing()
  showToast('info', 'Änderungen wurden verworfen.')
}

async function onSave() {
  if (isSaving.value) return
  if (!isDirty.value) {
    cancelEditing()
    showToast('info', 'Es gab keine Änderungen zu speichern.')
    return
  }
  try {
    const ok = await save()
    if (ok) {
      showToast('success', 'Ihr Profil wurde erfolgreich gespeichert.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      await nextTick()
      errorSummary.value?.focus()
      errorSummary.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  } catch (e) {
    showToast('error', e instanceof Error ? e.message : 'Beim Speichern ist ein Fehler aufgetreten.')
  }
}

function onKeydown(event: KeyboardEvent) {
  if (isEditing.value && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    void onSave()
  }
}

function onBeforeUnload(event: BeforeUnloadEvent) {
  if (isEditing.value && isDirty.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(() => {
  if (!saved.value) void load()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('beforeunload', onBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', onBeforeUnload)
})
</script>

<template>
  <div class="page container">
    <nav class="breadcrumb" aria-label="Brotkrumen-Navigation">
      <ol>
        <li>Startseite</li>
        <li>Mein Studium</li>
        <li aria-current="page">Mein Profil</li>
      </ol>
    </nav>

    <div class="page__head">
      <div>
        <h1 class="page__title">Mein Profil</h1>
        <p class="page__subtitle">Verwalten Sie Ihre persönlichen Angaben und Studieninformationen.</p>
      </div>
      <div v-if="current" class="page__actions">
        <button v-if="!isEditing" type="button" class="btn btn-primary" @click="onEdit">
          <BaseIcon name="edit" class="btn-icon" />
          Profil bearbeiten
        </button>
      </div>
    </div>

    <!-- Ladezustand -->
    <div v-if="isLoading" class="state" role="status">
      <span class="spinner state__spinner" aria-hidden="true" />
      Profil wird geladen …
    </div>

    <!-- Fehlerzustand -->
    <div v-else-if="loadError || !current" class="state state--error" role="alert">
      <BaseIcon name="alert" class="btn-icon" />
      <span>{{ loadError ?? 'Das Profil ist nicht verfügbar.' }}</span>
      <button type="button" class="btn btn-secondary" @click="load">
        <BaseIcon name="refresh" class="btn-icon" />
        Erneut versuchen
      </button>
    </div>

    <div v-else class="layout">
      <ProfileSummary :profile="current" class="layout__aside" />

      <form class="layout__main" novalidate @submit.prevent="onSave">
        <div v-if="isEditing" class="notice" role="note">
          <BaseIcon name="info" class="notice__icon" />
          <p>
            Sie bearbeiten Ihr Profil. Pflichtfelder sind mit <span class="notice__star">*</span> gekennzeichnet.
            Felder mit <BaseIcon name="lock" class="notice__lock" /><span class="visually-hidden">Schloss-Symbol</span>
            werden vom Immatrikulationsamt gepflegt.
          </p>
        </div>

        <div
          v-if="isEditing && errorList.length > 0"
          ref="errorSummary"
          class="error-summary"
          role="alert"
          tabindex="-1"
        >
          <h2 class="error-summary__title">
            <BaseIcon name="alert" class="btn-icon" />
            Bitte korrigieren Sie {{ errorList.length === 1 ? 'folgende Angabe' : `folgende ${errorList.length} Angaben` }}:
          </h2>
          <ul>
            <li v-for="[path, message] in errorList" :key="path">
              <a :href="`#${fieldId(path)}`" @click.prevent="focusField(path)">
                <strong>{{ fieldLabels[path] ?? path }}:</strong> {{ message }}
              </a>
            </li>
          </ul>
        </div>

        <ProfileSection
          id="section-personal"
          title="Persönliche Angaben"
          icon="user"
          description="Ihre Stammdaten, wie sie für Bescheinigungen und Zeugnisse verwendet werden."
        >
          <FormField
            id="personal-anrede"
            v-model="current.personal.anrede"
            label="Anrede"
            type="select"
            :options="ANREDEN"
            :editing="isEditing"
            required
            autocomplete="honorific-prefix"
          />
          <FormField
            id="personal-titel"
            v-model="current.personal.titel"
            label="Akademischer Titel"
            :editing="isEditing"
            :error="err('personal.titel')"
            placeholder="z. B. B.Sc."
            :maxlength="30"
            @blur="markTouched('personal.titel')"
          />
          <FormField
            id="personal-vorname"
            v-model="current.personal.vorname"
            label="Vorname"
            :editing="isEditing"
            :error="err('personal.vorname')"
            required
            autocomplete="given-name"
            :maxlength="50"
            @blur="markTouched('personal.vorname')"
          />
          <FormField
            id="personal-nachname"
            v-model="current.personal.nachname"
            label="Nachname"
            :editing="isEditing"
            :error="err('personal.nachname')"
            required
            autocomplete="family-name"
            :maxlength="50"
            @blur="markTouched('personal.nachname')"
          />
          <FormField
            id="personal-geburtsdatum"
            v-model="current.personal.geburtsdatum"
            label="Geburtsdatum"
            type="date"
            :editing="isEditing"
            :error="err('personal.geburtsdatum')"
            required
            autocomplete="bday"
            min="1900-01-01"
            @blur="markTouched('personal.geburtsdatum')"
          />
          <FormField
            id="personal-geburtsort"
            v-model="current.personal.geburtsort"
            label="Geburtsort"
            :editing="isEditing"
            :error="err('personal.geburtsort')"
            :maxlength="50"
            @blur="markTouched('personal.geburtsort')"
          />
          <FormField
            id="personal-staatsangehoerigkeit"
            v-model="current.personal.staatsangehoerigkeit"
            label="Staatsangehörigkeit"
            type="select"
            :options="STAATSANGEHOERIGKEITEN"
            :editing="isEditing"
            :error="err('personal.staatsangehoerigkeit')"
            required
            @blur="markTouched('personal.staatsangehoerigkeit')"
          />
        </ProfileSection>

        <ProfileSection
          id="section-contact"
          title="Kontakt & Anschrift"
          icon="home"
          description="Unter dieser Anschrift erhalten Sie postalische Mitteilungen der Hochschule."
        >
          <FormField
            id="personal-privateEmail"
            v-model="current.personal.privateEmail"
            label="Private E-Mail"
            type="email"
            :editing="isEditing"
            :error="err('personal.privateEmail')"
            required
            autocomplete="email"
            :maxlength="254"
            @blur="markTouched('personal.privateEmail')"
          />
          <FormField
            id="personal-telefon"
            v-model="current.personal.telefon"
            label="Telefon"
            type="tel"
            :editing="isEditing"
            :error="err('personal.telefon')"
            autocomplete="tel"
            placeholder="+49 30 1234567"
            :maxlength="23"
            @blur="markTouched('personal.telefon')"
          />
          <FormField
            id="personal-strasse"
            v-model="current.personal.strasse"
            label="Straße und Hausnummer"
            :editing="isEditing"
            :error="err('personal.strasse')"
            required
            wide
            autocomplete="street-address"
            :maxlength="100"
            @blur="markTouched('personal.strasse')"
          />
          <FormField
            id="personal-plz"
            v-model="current.personal.plz"
            label="PLZ"
            :editing="isEditing"
            :error="err('personal.plz')"
            required
            autocomplete="postal-code"
            :maxlength="10"
            @blur="markTouched('personal.plz')"
          />
          <FormField
            id="personal-ort"
            v-model="current.personal.ort"
            label="Ort"
            :editing="isEditing"
            :error="err('personal.ort')"
            required
            autocomplete="address-level2"
            :maxlength="50"
            @blur="markTouched('personal.ort')"
          />
          <FormField
            id="personal-land"
            v-model="current.personal.land"
            label="Land"
            type="select"
            :options="LAENDER"
            :editing="isEditing"
            :error="err('personal.land')"
            required
            @blur="markTouched('personal.land')"
            @update:model-value="markTouched('personal.plz')"
          />
        </ProfileSection>

        <ProfileSection
          id="section-study"
          title="Studienbezogene Informationen"
          icon="study"
          description="Angaben zu Ihrem aktuellen Studium an der Hochschule."
        >
          <FormField
            id="study-matrikelnummer"
            :model-value="current.study.matrikelnummer"
            label="Matrikelnummer"
            :editing="isEditing"
            locked
          />
          <FormField
            id="study-status"
            :model-value="current.study.status"
            label="Status"
            type="select"
            :options="statusOptions"
            :editing="isEditing"
            locked
          />
          <FormField
            id="study-hochschulEmail"
            :model-value="current.study.hochschulEmail"
            label="Hochschul-E-Mail"
            :editing="isEditing"
            locked
            wide
            hint="Ihre Hochschuladresse wird automatisch vergeben und kann nicht geändert werden."
          />
          <FormField
            id="study-studiengangId"
            v-model="current.study.studiengangId"
            label="Studiengang"
            type="select"
            :options="studiengangOptions"
            :editing="isEditing"
            :error="err('study.studiengangId')"
            required
            wide
            @blur="markTouched('study.studiengangId')"
          />
          <FormField
            id="study-abschluss"
            :model-value="studiengang?.abschluss ?? ''"
            label="Abschluss"
            :editing="isEditing"
            locked
          />
          <FormField
            id="study-fachbereich"
            :model-value="studiengang?.fachbereich ?? ''"
            label="Fachbereich"
            :editing="isEditing"
            locked
          />
          <FormField
            id="study-fachsemester"
            v-model="current.study.fachsemester"
            label="Fachsemester"
            type="number"
            :editing="isEditing"
            :error="err('study.fachsemester')"
            required
            :min="1"
            :max="20"
            :hint="studiengang ? `Regelstudienzeit: ${studiengang.regelstudienzeit} Semester` : undefined"
            @blur="markTouched('study.fachsemester')"
          />
          <FormField
            id="study-studienbeginn"
            v-model="current.study.studienbeginn"
            label="Studienbeginn"
            type="select"
            :options="semesterOptions"
            :editing="isEditing"
            :error="err('study.studienbeginn')"
            required
            @blur="markTouched('study.studienbeginn')"
          />
          <FormField
            id="study-schwerpunkt"
            v-model="current.study.schwerpunkt"
            label="Studienschwerpunkt"
            :editing="isEditing"
            :error="err('study.schwerpunkt')"
            wide
            placeholder="z. B. Softwareentwicklung"
            :maxlength="80"
            @blur="markTouched('study.schwerpunkt')"
          />
        </ProfileSection>

        <div v-if="isEditing" class="action-bar">
          <span class="action-bar__state" aria-live="polite">
            <template v-if="isDirty">Ungespeicherte Änderungen</template>
            <template v-else>Keine Änderungen</template>
          </span>
          <div class="action-bar__buttons">
            <button type="button" class="btn btn-secondary" :disabled="isSaving" @click="onCancel">
              <BaseIcon name="close" class="btn-icon" />
              Abbrechen
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving || !isDirty" :aria-busy="isSaving">
              <span v-if="isSaving" class="spinner" aria-hidden="true" />
              <BaseIcon v-else name="save" class="btn-icon" />
              {{ isSaving ? 'Speichert …' : 'Speichern' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <ConfirmDialog
      :open="showDiscardDialog"
      title="Änderungen verwerfen?"
      message="Sie haben ungespeicherte Änderungen. Wenn Sie fortfahren, gehen diese verloren."
      confirm-label="Verwerfen"
      cancel-label="Weiter bearbeiten"
      danger
      @confirm="confirmDiscard"
      @cancel="showDiscardDialog = false"
    />
  </div>
</template>

<style scoped>
.page {
  padding-top: 20px;
}

.breadcrumb ol {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.82rem;
  color: var(--htw-gray-500);
}

.breadcrumb li + li::before {
  content: '›';
  margin-right: 6px;
}

.breadcrumb [aria-current='page'] {
  color: var(--htw-anthracite);
  font-weight: 600;
}

.page__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin: 16px 0 28px;
}

.page__title {
  font-size: 2rem;
  position: relative;
  padding-bottom: 10px;
}

.page__title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 56px;
  height: 4px;
  background: var(--htw-green);
}

.page__subtitle {
  margin: 12px 0 0;
  color: var(--htw-gray-700);
}

.state {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  padding: 40px 28px;
  background: var(--htw-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  color: var(--htw-gray-700);
}

.state__spinner {
  color: var(--htw-green);
  width: 24px;
  height: 24px;
}

.state--error {
  color: var(--color-error);
}

.layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.layout__aside {
  position: sticky;
  top: 20px;
}

.layout__main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.notice {
  display: flex;
  gap: 12px;
  padding: 14px 18px;
  background: var(--htw-green-light);
  border-left: 4px solid var(--htw-green);
  border-radius: var(--radius-sm);
  font-size: 0.92rem;
}

.notice p {
  margin: 0;
}

.notice__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--htw-green-darker);
}

.notice__star {
  color: var(--color-error);
  font-weight: 700;
}

.notice__lock {
  width: 14px;
  height: 14px;
  vertical-align: -2px;
}

.error-summary {
  padding: 18px 22px;
  background: var(--color-error-bg);
  border: 2px solid var(--color-error);
  border-radius: var(--radius-sm);
}

.error-summary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(196, 22, 28, 0.3);
}

.error-summary__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: var(--color-error);
}

.error-summary ul {
  margin: 10px 0 0;
  padding-left: 26px;
}

.error-summary li + li {
  margin-top: 4px;
}

.error-summary a {
  color: var(--color-error);
  font-size: 0.92rem;
}

.action-bar {
  position: sticky;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  background: var(--htw-white);
  border-top: 3px solid var(--htw-green);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
}

.action-bar__state {
  font-size: 0.88rem;
  color: var(--htw-gray-500);
}

.action-bar__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .layout__aside {
    position: static;
  }
}

@media (max-width: 600px) {
  .page__title {
    font-size: 1.6rem;
  }

  .page__actions,
  .page__actions .btn {
    width: 100%;
  }

  .action-bar {
    margin: 0 -16px;
    padding: 12px 16px;
    border-radius: 0;
  }

  .action-bar__state {
    display: none;
  }

  .action-bar__buttons {
    flex: 1;
    flex-wrap: nowrap;
  }

  .action-bar__buttons .btn {
    flex: 1;
    padding: 0 12px;
  }
}
</style>

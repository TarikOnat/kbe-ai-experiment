<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from './BaseIcon.vue'
import { STATUS_LABELS, findStudiengang } from '@/data/catalog'
import type { StudentProfile } from '@/types/profile'

const props = defineProps<{ profile: StudentProfile }>()

const fullName = computed(() => {
  const { titel, vorname, nachname } = props.profile.personal
  return [titel, vorname, nachname].map((s) => s.trim()).filter(Boolean).join(' ') || 'Unbenannt'
})

const initials = computed(() => {
  const { vorname, nachname } = props.profile.personal
  const letters = [vorname, nachname].map((s) => s.trim().charAt(0).toUpperCase()).join('')
  return letters || '?'
})

const studiengang = computed(() => findStudiengang(props.profile.study.studiengangId))

/** Anteil der ausgefüllten Felder (inkl. optionaler Angaben). */
const completeness = computed(() => {
  const { personal, study } = props.profile
  const values: unknown[] = [
    personal.vorname,
    personal.nachname,
    personal.geburtsdatum,
    personal.geburtsort,
    personal.staatsangehoerigkeit,
    personal.privateEmail,
    personal.telefon,
    personal.strasse,
    personal.plz,
    personal.ort,
    personal.land,
    study.studiengangId,
    study.fachsemester,
    study.studienbeginn,
    study.schwerpunkt,
  ]
  const filled = values.filter((v) => (typeof v === 'number' ? Number.isFinite(v) && v > 0 : String(v).trim() !== '')).length
  return Math.round((filled / values.length) * 100)
})

const lastSaved = computed(() => {
  if (!props.profile.updatedAt) return null
  const date = new Date(props.profile.updatedAt)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })
})
</script>

<template>
  <aside class="summary" aria-label="Profilübersicht">
    <div class="summary__avatar" aria-hidden="true">{{ initials }}</div>
    <h2 class="summary__name">{{ fullName }}</h2>
    <p class="summary__program">
      {{ studiengang ? `${studiengang.name} (${studiengang.abschluss})` : 'Kein Studiengang' }}
    </p>
    <span class="summary__status" :class="`summary__status--${profile.study.status}`">
      <BaseIcon name="check" class="summary__status-icon" />
      {{ STATUS_LABELS[profile.study.status] }}
    </span>

    <dl class="summary__facts">
      <div>
        <dt>Matrikelnummer</dt>
        <dd>{{ profile.study.matrikelnummer }}</dd>
      </div>
      <div>
        <dt>Fachsemester</dt>
        <dd>{{ Number.isFinite(profile.study.fachsemester) ? profile.study.fachsemester : '—' }}</dd>
      </div>
      <div>
        <dt>Hochschul-E-Mail</dt>
        <dd class="summary__mail">{{ profile.study.hochschulEmail }}</dd>
      </div>
    </dl>

    <div class="summary__progress">
      <div class="summary__progress-label">
        <span id="completeness-label">Profil vollständig</span>
        <strong>{{ completeness }} %</strong>
      </div>
      <div
        class="summary__bar"
        role="progressbar"
        aria-labelledby="completeness-label"
        :aria-valuenow="completeness"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="summary__bar-fill" :style="{ width: `${completeness}%` }" />
      </div>
    </div>

    <p class="summary__saved">
      <template v-if="lastSaved">Zuletzt gespeichert: {{ lastSaved }}</template>
      <template v-else>Noch keine Änderungen gespeichert</template>
    </p>
  </aside>
</template>

<style scoped>
.summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 24px 24px;
  background: var(--htw-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

.summary__avatar {
  display: grid;
  place-items: center;
  width: 104px;
  height: 104px;
  margin-bottom: 16px;
  border-radius: 50%;
  background: var(--htw-green);
  color: var(--htw-white);
  font-size: 2.3rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  box-shadow: 0 0 0 6px var(--htw-green-light);
}

.summary__name {
  font-size: 1.3rem;
  overflow-wrap: anywhere;
}

.summary__program {
  margin: 6px 0 12px;
  color: var(--htw-gray-700);
  font-size: 0.95rem;
}

.summary__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary__status--immatrikuliert {
  background: var(--htw-green-light);
  color: var(--htw-green-darker);
}

.summary__status--beurlaubt {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.summary__status--exmatrikuliert {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.summary__status-icon {
  width: 14px;
  height: 14px;
}

.summary__facts {
  width: 100%;
  margin: 24px 0 0;
  padding: 16px 0 0;
  border-top: 1px solid var(--htw-gray-200);
  display: grid;
  gap: 12px;
  text-align: left;
}

.summary__facts div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.summary__facts dt {
  color: var(--htw-gray-500);
  font-size: 0.85rem;
}

.summary__facts dd {
  margin: 0;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: right;
}

.summary__mail {
  overflow-wrap: anywhere;
}

.summary__progress {
  width: 100%;
  margin-top: 24px;
}

.summary__progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 6px;
}

.summary__bar {
  height: 8px;
  background: var(--htw-gray-200);
  border-radius: 999px;
  overflow: hidden;
}

.summary__bar-fill {
  height: 100%;
  background: var(--htw-green);
  border-radius: inherit;
  transition: width 0.3s ease;
}

.summary__saved {
  margin: 16px 0 0;
  font-size: 0.8rem;
  color: var(--htw-gray-500);
}
</style>

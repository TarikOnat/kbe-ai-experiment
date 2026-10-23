<script lang="ts">
export interface SelectOption {
  value: string
  label: string
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from './BaseIcon.vue'
import { parseIsoDate } from '@/utils/validation'

const props = withDefaults(
  defineProps<{
    id: string
    label: string
    modelValue: string | number
    editing: boolean
    type?: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select'
    options?: (SelectOption | string)[]
    error?: string
    required?: boolean
    /** Von der Verwaltung gepflegt – auch im Bearbeitungsmodus nicht änderbar. */
    locked?: boolean
    hint?: string
    placeholder?: string
    autocomplete?: string
    min?: number | string
    max?: number | string
    maxlength?: number
    /** Vollständige Breite im Formularraster. */
    wide?: boolean
  }>(),
  { type: 'text', options: () => [], required: false, locked: false, wide: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: []
}>()

const normalizedOptions = computed<SelectOption[]>(() =>
  props.options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)),
)

const isInput = computed(() => props.editing && !props.locked)
const errorId = computed(() => `${props.id}-error`)
const hintId = computed(() => `${props.id}-hint`)
const describedBy = computed(
  () => [props.error ? errorId.value : null, props.hint ? hintId.value : null].filter(Boolean).join(' ') || undefined,
)

const displayValue = computed(() => {
  const value = props.modelValue
  if (value === '' || value === null || value === undefined || (typeof value === 'number' && Number.isNaN(value))) {
    return '—'
  }
  if (props.type === 'date' && typeof value === 'string') {
    const date = parseIsoDate(value)
    return date ? date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : value
  }
  if (props.type === 'select') {
    return normalizedOptions.value.find((o) => o.value === value)?.label ?? String(value)
  }
  return String(value)
})

function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement | HTMLSelectElement).value
  if (props.type === 'number') {
    emit('update:modelValue', raw === '' ? Number.NaN : Number(raw))
  } else {
    emit('update:modelValue', raw)
  }
}

const inputValue = computed(() =>
  typeof props.modelValue === 'number' && Number.isNaN(props.modelValue) ? '' : props.modelValue,
)
</script>

<template>
  <div class="field" :class="{ 'field--wide': wide, 'field--error': isInput && error, 'field--locked': editing && locked }">
    <label v-if="isInput" :for="id" class="field__label">
      {{ label }}<span v-if="required" class="field__required" aria-hidden="true"> *</span>
    </label>
    <span v-else :id="`${id}-label`" class="field__label">
      {{ label }}
      <BaseIcon v-if="locked" name="lock" class="field__lock" />
      <span v-if="locked" class="visually-hidden">(nicht änderbar)</span>
    </span>

    <template v-if="isInput">
      <select
        v-if="type === 'select'"
        :id="id"
        class="field__control"
        :value="modelValue"
        :required="required"
        :aria-invalid="error ? 'true' : 'false'"
        :aria-describedby="describedBy"
        :autocomplete="autocomplete"
        @change="onInput"
        @blur="emit('blur')"
      >
        <option v-if="!required || modelValue === ''" value="" :disabled="required">Bitte auswählen …</option>
        <option v-for="opt in normalizedOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <input
        v-else
        :id="id"
        class="field__control"
        :type="type"
        :value="inputValue"
        :required="required"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :maxlength="maxlength"
        :inputmode="type === 'number' ? 'numeric' : undefined"
        :aria-invalid="error ? 'true' : 'false'"
        :aria-describedby="describedBy"
        @input="onInput"
        @blur="emit('blur')"
      />
    </template>
    <p v-else class="field__value" :class="{ 'field__value--empty': displayValue === '—' }">
      <span v-if="displayValue === '—'" class="visually-hidden">Keine Angabe</span>
      <span :aria-hidden="displayValue === '—' ? 'true' : undefined">{{ displayValue }}</span>
    </p>

    <p v-if="isInput && error" :id="errorId" class="field__error">
      <BaseIcon name="alert" class="field__error-icon" />
      {{ error }}
    </p>
    <p v-if="hint && (isInput || (editing && locked))" :id="hintId" class="field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.field--wide {
  grid-column: 1 / -1;
}

.field__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--htw-gray-500);
}

.field__required {
  color: var(--color-error);
}

.field__lock {
  width: 13px;
  height: 13px;
}

.field__value {
  margin: 0;
  min-height: 24px;
  font-size: 1rem;
  color: var(--htw-anthracite);
  overflow-wrap: anywhere;
}

.field__value--empty {
  color: var(--htw-gray-300);
}

.field--locked .field__value {
  padding: 9px 12px;
  background: var(--htw-gray-100);
  border: 1px dashed var(--htw-gray-300);
  border-radius: var(--radius-sm);
  color: var(--htw-gray-700);
}

.field__control {
  width: 100%;
  min-height: 44px;
  padding: 9px 12px;
  background: var(--htw-white);
  border: 1px solid var(--htw-gray-300);
  border-radius: var(--radius-sm);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.field__control:hover {
  border-color: var(--htw-gray-500);
}

.field__control:focus {
  outline: none;
  border-color: var(--htw-green-dark);
  box-shadow: var(--focus-ring);
}

.field--error .field__control {
  border-color: var(--color-error);
  background: #fffafa;
}

.field--error .field__control:focus {
  box-shadow: 0 0 0 3px rgba(196, 22, 28, 0.25);
}

.field__error {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-error);
}

.field__error-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.field__hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--htw-gray-500);
}
</style>

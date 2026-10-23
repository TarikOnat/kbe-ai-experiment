<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
  }>(),
  { confirmLabel: 'Bestätigen', cancelLabel: 'Abbrechen', danger: false },
)

const emit = defineEmits<{ confirm: []; cancel: [] }>()

const dialog = ref<HTMLDialogElement | null>(null)
const cancelButton = ref<HTMLButtonElement | null>(null)

watch(
  () => props.open,
  async (open) => {
    await nextTick()
    const el = dialog.value
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      // Sichere Aktion vorfokussieren
      cancelButton.value?.focus()
    } else if (!open && el.open) {
      el.close()
    }
  },
)

/** ESC-Taste löst das native "cancel"-Event aus. */
function onNativeCancel(event: Event) {
  event.preventDefault()
  emit('cancel')
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) emit('cancel')
}
</script>

<template>
  <dialog
    ref="dialog"
    class="dialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-message"
    @cancel="onNativeCancel"
    @click="onBackdropClick"
  >
    <div class="dialog__body">
      <h2 id="dialog-title" class="dialog__title">{{ title }}</h2>
      <p id="dialog-message" class="dialog__message">{{ message }}</p>
      <div class="dialog__actions">
        <button ref="cancelButton" type="button" class="btn btn-secondary" @click="emit('cancel')">
          {{ cancelLabel }}
        </button>
        <button type="button" class="btn" :class="danger ? 'btn-danger' : 'btn-primary'" @click="emit('confirm')">
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.dialog {
  width: min(460px, calc(100vw - 32px));
  padding: 0;
  border: none;
  border-top: 4px solid var(--htw-green);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-raised);
  color: var(--htw-anthracite);
}

.dialog::backdrop {
  background: rgba(30, 30, 30, 0.5);
}

.dialog__body {
  padding: 24px;
}

.dialog__title {
  font-size: 1.2rem;
}

.dialog__message {
  margin: 10px 0 24px;
  color: var(--htw-gray-700);
}

.dialog__actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
}
</style>

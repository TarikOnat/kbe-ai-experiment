<script lang="ts">
export interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}
</script>

<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'

defineProps<{ toasts: Toast[] }>()
defineEmits<{ dismiss: [id: number] }>()

const icons = { success: 'check', error: 'alert', info: 'info' } as const
</script>

<template>
  <div class="toasts" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`" role="status">
        <BaseIcon :name="icons[toast.type]" class="toast__icon" />
        <span class="toast__message">{{ toast.message }}</span>
        <button type="button" class="toast__close" @click="$emit('dismiss', toast.id)">
          <BaseIcon name="close" class="toast__close-icon" />
          <span class="visually-hidden">Hinweis schließen</span>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(400px, calc(100vw - 32px));
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 14px 14px 16px;
  background: var(--htw-white);
  border-left: 5px solid var(--htw-green);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-raised);
  pointer-events: auto;
}

.toast--error {
  border-left-color: var(--color-error);
}

.toast--info {
  border-left-color: var(--htw-gray-500);
}

.toast__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--htw-green-dark);
}

.toast--error .toast__icon {
  color: var(--color-error);
}

.toast--info .toast__icon {
  color: var(--htw-gray-500);
}

.toast__message {
  flex: 1;
  font-size: 0.92rem;
}

.toast__close {
  display: grid;
  place-items: center;
  padding: 2px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--htw-gray-500);
  cursor: pointer;
}

.toast__close-icon {
  width: 16px;
  height: 16px;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 600px) {
  .toasts {
    right: 16px;
    bottom: 84px;
  }
}
</style>

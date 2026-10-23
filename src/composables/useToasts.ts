import { ref } from 'vue'
import type { Toast } from '@/components/ToastStack.vue'

const toasts = ref<Toast[]>([])
let nextId = 1

const DURATION_MS: Record<Toast['type'], number> = {
  success: 4000,
  info: 4000,
  error: 7000,
}

export function useToasts() {
  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function show(type: Toast['type'], message: string) {
    const id = nextId++
    // Maximal drei Hinweise gleichzeitig anzeigen
    toasts.value = [...toasts.value.slice(-2), { id, type, message }]
    setTimeout(() => dismiss(id), DURATION_MS[type])
  }

  return { toasts, show, dismiss }
}

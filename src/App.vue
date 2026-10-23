<script setup lang="ts">
import { computed, ref } from 'vue'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ToastStack from '@/components/ToastStack.vue'
import { useProfile } from '@/composables/useProfile'
import { useToasts } from '@/composables/useToasts'
import ProfileView from '@/views/ProfileView.vue'

const { saved, resetToDemo } = useProfile()
const { toasts, show: showToast, dismiss } = useToasts()

const userName = computed(() => {
  const p = saved.value?.personal
  return p ? `${p.vorname} ${p.nachname}`.trim() : 'Anmelden'
})

const showResetDialog = ref(false)

async function confirmReset() {
  showResetDialog.value = false
  await resetToDemo()
  showToast('info', 'Die Demo-Daten wurden wiederhergestellt.')
}
</script>

<template>
  <a class="skip-link" href="#main">Zum Inhalt springen</a>
  <AppHeader :user-name="userName" />
  <main id="main" tabindex="-1">
    <ProfileView />
  </main>
  <AppFooter @reset-demo="showResetDialog = true" />

  <ToastStack :toasts="toasts" @dismiss="dismiss" />
  <ConfirmDialog
    :open="showResetDialog"
    title="Demo-Daten zurücksetzen?"
    message="Alle gespeicherten Profiländerungen werden gelöscht und die ursprünglichen Beispieldaten geladen."
    confirm-label="Zurücksetzen"
    danger
    @confirm="confirmReset"
    @cancel="showResetDialog = false"
  />
</template>

<style scoped>
.skip-link {
  position: absolute;
  left: 16px;
  top: -60px;
  z-index: 200;
  padding: 10px 16px;
  background: var(--htw-anthracite);
  color: var(--htw-white);
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.skip-link:focus {
  top: 12px;
}

main {
  outline: none;
}
</style>

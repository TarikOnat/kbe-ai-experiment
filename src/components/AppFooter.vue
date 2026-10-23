<script setup lang="ts">
defineEmits<{ resetDemo: [] }>()

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div>
        <strong>Studierendenportal</strong>
        <p>Fiktives Hochschulportal im Stil der HTW Berlin – erstellt im Rahmen eines KI-Experiments.</p>
      </div>
      <div class="footer__meta">
        <span>© {{ year }} Demo-Projekt</span>
        <button type="button" class="footer__reset" @click="$emit('resetDemo')">Demo-Daten zurücksetzen</button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 56px;
  background: var(--htw-anthracite);
  color: #d9d9d9;
  font-size: 0.85rem;
  border-top: 6px solid var(--htw-green);
}

.footer__inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px 40px;
  padding-top: 28px;
  padding-bottom: 28px;
}

.footer strong {
  color: var(--htw-white);
}

.footer p {
  margin: 4px 0 0;
}

.footer__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.footer__reset {
  padding: 0;
  background: none;
  border: none;
  color: var(--htw-green);
  text-decoration: underline;
  cursor: pointer;
}

@media (max-width: 600px) {
  .footer__meta {
    align-items: flex-start;
  }
}
</style>

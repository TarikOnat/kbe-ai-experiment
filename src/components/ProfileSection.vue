<script setup lang="ts">
import BaseIcon, { type IconName } from './BaseIcon.vue'

defineProps<{
  id: string
  title: string
  icon: IconName
  description?: string
}>()
</script>

<template>
  <section class="section" :aria-labelledby="`${id}-title`">
    <header class="section__header">
      <span class="section__icon"><BaseIcon :name="icon" /></span>
      <div>
        <h2 :id="`${id}-title`" class="section__title">{{ title }}</h2>
        <p v-if="description" class="section__description">{{ description }}</p>
      </div>
    </header>
    <div class="section__grid">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section {
  background: var(--htw-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  border-top: 4px solid var(--htw-green);
  padding: 24px 28px 28px;
}

.section__header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 18px;
  margin-bottom: 22px;
  border-bottom: 1px solid var(--htw-gray-200);
}

.section__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--htw-green-light);
  color: var(--htw-green-darker);
}

.section__icon svg {
  width: 20px;
  height: 20px;
}

.section__title {
  font-size: 1.2rem;
}

.section__description {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: var(--htw-gray-500);
}

.section__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 28px;
}

@media (max-width: 700px) {
  .section {
    padding: 20px 18px 22px;
  }

  .section__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

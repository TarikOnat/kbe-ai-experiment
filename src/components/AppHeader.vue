<script setup lang="ts">
import { ref } from 'vue'
import BaseIcon from './BaseIcon.vue'

defineProps<{ userName: string }>()

const navItems = [
  { label: 'Startseite', active: false },
  { label: 'Lehrveranstaltungen', active: false },
  { label: 'Prüfungen', active: false },
  { label: 'Mein Profil', active: true },
]

const menuOpen = ref(false)
</script>

<template>
  <header class="header">
    <div class="header__top">
      <div class="container header__top-inner">
        <span>Studierendenportal · Demo-Umgebung</span>
        <span lang="en">Deutsch | English</span>
      </div>
    </div>
    <div class="container header__main">
      <a class="logo" href="#main" aria-label="HTW Berlin Studierendenportal – zum Inhalt">
        <span class="logo__mark" aria-hidden="true">HTW</span>
        <span class="logo__text" aria-hidden="true">
          <strong>Hochschule für Technik<br />und Wirtschaft Berlin</strong>
          <span>University of Applied Sciences</span>
        </span>
      </a>

      <button
        class="header__burger"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="main-nav"
        @click="menuOpen = !menuOpen"
      >
        <BaseIcon :name="menuOpen ? 'close' : 'menu'" class="btn-icon" />
        <span class="visually-hidden">Navigation {{ menuOpen ? 'schließen' : 'öffnen' }}</span>
      </button>

      <nav id="main-nav" class="nav" :class="{ 'nav--open': menuOpen }" aria-label="Hauptnavigation">
        <ul>
          <li v-for="item in navItems" :key="item.label">
            <a
              v-if="item.active"
              class="nav__link nav__link--active"
              href="#main"
              aria-current="page"
              @click="menuOpen = false"
            >
              {{ item.label }}
            </a>
            <span v-else class="nav__link nav__link--disabled" title="In der Demo nicht verfügbar">
              {{ item.label }}
            </span>
          </li>
        </ul>
        <div class="nav__user">
          <BaseIcon name="user" class="btn-icon" />
          <span>{{ userName }}</span>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--htw-white);
  border-bottom: 1px solid var(--htw-gray-200);
  position: relative;
  z-index: 20;
}

.header__top {
  background: var(--htw-anthracite);
  color: #d9d9d9;
  font-size: 0.78rem;
}

.header__top-inner {
  display: flex;
  justify-content: space-between;
  padding-top: 6px;
  padding-bottom: 6px;
}

.header__main {
  display: flex;
  align-items: center;
  gap: 24px;
  min-height: var(--header-height);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--htw-anthracite);
}

.logo__mark {
  display: grid;
  place-items: center;
  width: 56px;
  height: 44px;
  background: var(--htw-green);
  color: var(--htw-white);
  font-weight: 800;
  font-size: 1.15rem;
  letter-spacing: 0.04em;
}

.logo__text {
  display: flex;
  flex-direction: column;
  font-size: 0.78rem;
  line-height: 1.25;
}

.logo__text strong {
  font-size: 0.85rem;
}

.logo__text span {
  color: var(--htw-gray-500);
}

.header__burger {
  display: none;
  margin-left: auto;
  padding: 10px;
  background: none;
  border: 1px solid var(--htw-gray-300);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.nav {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: auto;
}

.nav ul {
  display: flex;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav__link {
  display: block;
  padding: 24px 12px 21px;
  border-bottom: 3px solid transparent;
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--htw-anthracite);
  text-decoration: none;
}

.nav__link--active {
  border-bottom-color: var(--htw-green);
  color: var(--htw-green-darker);
}

.nav__link--disabled {
  color: var(--htw-gray-500);
  cursor: default;
}

.nav__user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--htw-gray-100);
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 960px) {
  .logo__text {
    display: none;
  }

  .header__burger {
    display: inline-flex;
  }

  .nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 8px 16px 16px;
    background: var(--htw-white);
    border-bottom: 1px solid var(--htw-gray-200);
    box-shadow: var(--shadow-raised);
  }

  .nav--open {
    display: flex;
  }

  .nav ul {
    flex-direction: column;
  }

  .nav__link {
    padding: 12px 8px;
    border-bottom: none;
    border-left: 3px solid transparent;
  }

  .nav__link--active {
    border-left-color: var(--htw-green);
  }

  .nav__user {
    margin-top: 8px;
    align-self: flex-start;
  }
}
</style>

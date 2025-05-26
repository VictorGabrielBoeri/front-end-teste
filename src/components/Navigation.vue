<template>
  <v-app-bar color="#111" flat elevation="2" class="custom-app-bar">
    <v-app-bar-title class="custom-title">
      <v-icon color="#7ed957" size="32" class="mr-2">mdi-bank</v-icon>
    </v-app-bar-title>
    <v-spacer />
    <v-btn
      v-if="isAuthenticated"
      icon
      @click="handleLogout"
      class="logout-btn"
    >
      <v-icon color="#7ed957">mdi-logout</v-icon>
    </v-btn>
  </v-app-bar>

  <v-navigation-drawer
    v-if="isAuthenticated"
    v-model="drawer"
    permanent
    class="custom-nav-drawer"
    color="#f5f7fa"
    elevation="1"
    width="220"
    style="height: 100vh; top: 0;"
    app
  >
    <v-list nav class="nav-list">
      <a
        v-for="item in navItems"
        :key="item.name"
        :href="router.resolve(item.to).href"
        class="nav-item"
        :class="{ 'nav-active': isActive(item.to) }"
        @click.prevent="navigateAndReload(item.to)"
        style="text-decoration: none; display: block;"
      >
        <v-list-item>
          <template #prepend>
            <v-icon :color="item.iconColor">{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.label }}</v-list-item-title>
        </v-list-item>
      </a>
    </v-list>
    <div class="nav-footer">
      <v-btn @click="toggleDarkMode" class="dark-mode-btn" icon>
        <v-icon>{{ isDarkMode ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
      </v-btn>
      <span class="dark-mode-label">{{ isDarkMode ? 'Modo Claro' : 'Modo Escuro' }}</span>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '../services/authService'
import { useSnackbar } from '../composables/useSnackbar'

const router = useRouter()
const route = useRoute()
const { showSuccess } = useSnackbar()
const drawer = ref(true)

const isAuthenticated = computed(() => authService.isAuthenticated())
const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')

const navItems = [
  { name: 'Dashboard', to: { name: 'Dashboard' }, label: 'Início', icon: 'mdi-home', iconColor: '#7ed957' },
  { name: 'Transfer', to: { name: 'Transfer' }, label: 'Transferências', icon: 'mdi-bank-transfer', iconColor: '#7ed957' },
  { name: 'Extract', to: { name: 'Extract' }, label: 'Extrato', icon: 'mdi-file-document', iconColor: '#7ed957' }
]

const handleLogout = () => {
  authService.logout()
  showSuccess('Logout realizado com sucesso!')
  window.location.href = '/login'
}

function navigateAndReload(to) {
  const href = router.resolve(to).href
  window.location.href = href
}

function isActive(to) {
  return router.resolve(to).href === route.fullPath
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode')
    localStorage.setItem('darkMode', 'true')
  } else {
    document.body.classList.remove('dark-mode')
    localStorage.setItem('darkMode', 'false')
  }
}

onMounted(() => {
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode')
  }
})
</script>

<style scoped>
.custom-app-bar {
  border-bottom: 1px solid #e0e0e0;
  background: #111 !important;
  color: #fff;
  z-index: 10;
}
.custom-title {
  color: #7ed957;
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}
.brand {
  color: #7ed957;
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: 0.5px;
}
.logout-btn {
  margin-right: 8px;
}
.custom-nav-drawer {
  border-right: 1px solid #e0e0e0;
  background: #f5f7fa !important;
  padding-top: 16px;
  height: 100vh !important;
  min-height: 100vh !important;
  z-index: 9;
}
.nav-list {
  margin-top: 32px;
}
.nav-item {
  border-radius: 8px;
  margin-top: 16px;
  font-weight: 500;
  color: #222;
  transition: background 0.2s, color 0.2s;
  padding: 12px 16px;
  display: block;
}
.nav-active {
  background: #e3f0df !important;
  color: #111 !important;
}
.nav-item:hover {
  background: #e3f0df !important;
  color: #111 !important;
}
.v-list-item-title {
  font-size: 1.08rem;
  font-weight: 500;
}
.nav-footer {
  position: absolute;
  bottom: 24px;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.dark-mode-btn {
  background: transparent !important;
  color: #222 !important;
}
.dark-mode-label {
  font-size: 0.95rem;
  color: #888;
}
</style>

<style>
.dark-mode {
  background: #181818 !important;
  color: #f5f5f5 !important;
}
.dark-mode .v-card,
.dark-mode .v-navigation-drawer,
.dark-mode .v-app-bar,
.dark-mode .v-list,
.dark-mode .v-list-item,
.dark-mode .v-btn,
.dark-mode .v-container,
.dark-mode .v-main {
  background: #232323 !important;
  color: #f5f5f5 !important;
}
.dark-mode .v-list-item-title,
.dark-mode .v-icon,
.dark-mode .v-btn,
.dark-mode .v-card-title {
  color: #f5f5f5 !important;
}
.dark-mode .nav-active {
  background: #222 !important;
  color: #7ed957 !important;
}
.dark-mode .v-chip {
  background: #333 !important;
  color: #7ed957 !important;
}
.dark-mode .text-success {
  color: #7ed957 !important;
}
.dark-mode .text-error {
  color: #e53935 !important;
}
.dark-mode .v-data-table,
.dark-mode .v-data-table__wrapper,
.dark-mode .v-data-table__td,
.dark-mode .v-data-table__th {
  background: #232323 !important;
  color: #f5f5f5 !important;
  border-color: #333 !important;
}
.dark-mode .v-data-table__tr {
  background: #232323 !important;
}
.dark-mode .v-data-table__td {
  border-bottom: 1px solid #333 !important;
}
.dark-mode .v-data-table__th {
  border-bottom: 2px solid #333 !important;
}
</style> 
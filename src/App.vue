<script setup lang="ts">
import { useSnackbar } from './composables/useSnackbar'
import Navigation from './components/Navigation.vue'
import { authService } from './services/authService'
import { computed } from 'vue'

const { snackbar } = useSnackbar()
const isAuthenticated = computed(() => authService.isAuthenticated())
</script>

<template>
  <v-app>
    <template v-if="isAuthenticated">
      <Navigation />
      <v-main class="main-content">
        <router-view />
      </v-main>
    </template>
    <template v-else>
      <v-main>
        <router-view />
      </v-main>
    </template>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<style>
@import 'vuetify/styles';
.main-content {
  min-height: 100vh;
  background: #f8faf8;
  padding: 40px 32px 32px 32px;
  box-sizing: border-box;
}
</style>

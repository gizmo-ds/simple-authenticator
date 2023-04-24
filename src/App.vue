<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import { UseDark } from '@vueuse/components'
</script>

<template>
  <use-dark v-slot="{ isDark }">
    <n-config-provider :theme="isDark ? darkTheme : undefined">
      <n-global-style />

      <n-message-provider placement="bottom">
        <n-layout>
          <app-header v-if="!$route.meta.hide_app_header" />

          <router-view />
        </n-layout>
      </n-message-provider>
    </n-config-provider>
  </use-dark>
</template>

<style lang="scss">
body {
  height: 100vh;
  margin: 0;
  line-height: inherit;
}
html,
#app {
  height: 100vh;
}
</style>

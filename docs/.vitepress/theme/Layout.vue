<template>
  <DefaultTheme.Layout>
    <template #nav-bar-title-before>
      <BrandMark />
    </template>
    <template v-if="isHome" #layout-bottom>
      <DocsFooter />
    </template>
  </DefaultTheme.Layout>
  <MermaidOverlay />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import BrandMark from './components/BrandMark.vue'
import DocsFooter from './components/DocsFooter.vue'
import MermaidOverlay from './components/MermaidOverlay.vue'

const route = useRoute()
const isHome = computed(() => route.path === '/' || route.path === '/index.html')
</script>

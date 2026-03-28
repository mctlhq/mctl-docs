<template>
  <DefaultTheme.Layout>
    <template #nav-bar-title-before>
      <BrandMark />
    </template>
    <template #layout-bottom>
      <DocsFooter />
    </template>
  </DefaultTheme.Layout>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import BrandMark from './components/BrandMark.vue'
import DocsFooter from './components/DocsFooter.vue'
</script>

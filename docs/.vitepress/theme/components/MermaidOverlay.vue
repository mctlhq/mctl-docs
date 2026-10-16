<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="mermaid-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Expanded diagram"
      @click.self="close"
    >
      <div class="mermaid-overlay__panel">
        <button class="mermaid-overlay__close" type="button" aria-label="Close diagram" @click="close">
          Close
        </button>
        <div class="mermaid-overlay__content">
          <div v-if="svg" ref="diagram" class="mermaid-overlay__diagram" v-html="svg" />
          <pre v-else>{{ fallbackSource }}</pre>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { renderMermaidSvg } from '../mermaid'
import { wireMermaidLinks } from '../mermaid-links'

type MermaidOpenDetail = {
  source: string
}

const diagram = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const svg = ref('')
const fallbackSource = ref('')

async function openDiagram(detail: MermaidOpenDetail) {
  svg.value = ''
  fallbackSource.value = detail.source
  try {
    const rendered = await renderMermaidSvg(detail.source, 'overlay')
    svg.value = rendered.svg
  } catch (error) {
    console.error('Could not render expanded Mermaid diagram', error)
  }
  isOpen.value = true
  await nextTick()
  if (diagram.value) wireMermaidLinks(diagram.value)
}

function close() {
  isOpen.value = false
  svg.value = ''
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

function onOpen(event: Event) {
  const customEvent = event as CustomEvent<MermaidOpenDetail>
  void openDiagram(customEvent.detail)
}

onMounted(() => {
  window.addEventListener('mctl:open-mermaid', onOpen as EventListener)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('mctl:open-mermaid', onOpen as EventListener)
  window.removeEventListener('keydown', onKeydown)
})
</script>

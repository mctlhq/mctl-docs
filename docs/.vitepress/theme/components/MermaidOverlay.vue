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
          <div v-if="svg" class="mermaid-overlay__diagram" v-html="svg" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { renderMermaidSvg } from '../mermaid'

type MermaidOpenDetail = {
  source: string
}

const isOpen = ref(false)
const svg = ref('')

async function openDiagram(detail: MermaidOpenDetail) {
  const rendered = await renderMermaidSvg(detail.source, 'overlay')
  svg.value = rendered.svg
  isOpen.value = true
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

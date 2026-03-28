<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="mermaid-link-confirm"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm external link"
      @click.self="close"
    >
      <div class="mermaid-link-confirm__panel">
        <p class="mermaid-link-confirm__eyebrow">External access</p>
        <h2 class="mermaid-link-confirm__title">Open platform link?</h2>
        <p class="mermaid-link-confirm__text">
          This surface is available only after your tenant is created and access is granted.
          Request access first if you do not already have it.
        </p>
        <p class="mermaid-link-confirm__target">{{ href }}</p>
        <div class="mermaid-link-confirm__actions">
          <button class="mermaid-link-confirm__button mermaid-link-confirm__button--secondary" type="button" @click="close">
            Cancel
          </button>
          <a
            class="mermaid-link-confirm__button mermaid-link-confirm__button--primary"
            :href="href"
            target="_blank"
            rel="noreferrer"
            @click="close"
          >
            Continue
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

type MermaidLinkDetail = {
  href: string
}

const isOpen = ref(false)
const href = ref('')

function close() {
  isOpen.value = false
  href.value = ''
}

function onOpen(event: Event) {
  const customEvent = event as CustomEvent<MermaidLinkDetail>
  href.value = customEvent.detail.href
  isOpen.value = true
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  window.addEventListener('mctl:confirm-mermaid-link', onOpen as EventListener)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('mctl:confirm-mermaid-link', onOpen as EventListener)
  window.removeEventListener('keydown', onKeydown)
})
</script>

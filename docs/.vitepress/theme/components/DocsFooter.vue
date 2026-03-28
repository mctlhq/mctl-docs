<template>
  <footer class="docs-footer">
    <div class="docs-footer__content">
      <div class="docs-footer__logo">
        <a href="https://docs.mctl.ai" class="docs-footer__logo-link" aria-label="MCTL Docs">
          <BrandMark />
        </a>
      </div>
      <div class="docs-footer__links">
        <a href="/platform/overview">Platform</a>
        <a href="/mcp/overview">MCP</a>
        <a href="/api/">API</a>
        <a href="https://app.mctl.ai">Portal</a>
        <a href="https://github.com/mctlhq">GitHub</a>
        <a href="https://mctl.ai/privacy">Privacy Policy</a>
      </div>
      <div class="docs-footer__copy">© 2026 MCTL. All rights reserved.</div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import BrandMark from './BrandMark.vue'
</script>

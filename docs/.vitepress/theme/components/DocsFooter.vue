<template>
  <!-- Shared public-site footer from ui.mctl.ai site.css: full-bleed, centred. -->
  <footer class="mctl-site-footer docs-footer">
    <div class="mctl-site-container mctl-site-footer__inner">
      <a href="https://docs.mctl.ai" class="docs-footer__logo-link" aria-label="MCTL Docs">
        <BrandMark />
      </a>
      <nav class="mctl-site-footer__links" aria-label="Footer">
        <a href="/platform/overview">Platform</a>
        <a href="/mcp/overview">MCP</a>
        <a href="/api/">API</a>
        <a href="https://app.mctl.ai">Portal</a>
        <a href="https://github.com/mctlhq">GitHub</a>
        <a href="https://mctl.ai/privacy">Privacy Policy</a>
      </nav>
      <p class="mctl-site-footer__copy">© 2026 MCTL. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import BrandMark from './BrandMark.vue'
</script>

# mctl-docs

VitePress documentation portal for the MCTL platform (docs.mctl.ai).

## Stack
- VitePress 1.6+
- nginx serves static build output
- Docker multi-stage build (node:22-alpine -> nginx:alpine)

## Conventions
- All docs in `docs/` directory as Markdown
- VitePress config in `.vitepress/config.ts`
- Brand theme in `.vitepress/theme/custom.css`
- No emoji in content unless explicitly requested
- English for all content

## Key Paths
- `docs/` — Markdown content
- `.vitepress/config.ts` — navigation, sidebar, theme config
- `.vitepress/theme/` — custom theme and CSS
- `nginx.conf` — production nginx config
- `Dockerfile` — multi-stage Docker build

## Workflow
- All changes through feature branches
- Tag format: `MAJOR.MINOR.PATCH` (no `v` prefix)
- Tag push triggers CI/CD build and GitOps update

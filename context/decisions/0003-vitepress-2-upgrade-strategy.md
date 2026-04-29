# 0003. VitePress 1.6 → 2.x Upgrade Strategy

**Status:** proposed
**Date:** 2026-04-28

## Context

mctl-docs runs on VitePress 1.6 (see `package.json`, `devDependencies.vitepress`).
As of April 2026 the upstream VitePress 2.0 release line is still in alpha
(latest tag at the time of writing: `v2.0.0-alpha.17`, published 2026-03-19).
The 1.6 → 2.x transition involves breaking changes to sidebar config, theme
internals and the `defineConfig` shape — the upgrade is not a drop-in.

Without a documented plan the team risks being caught flat-footed when
VitePress 2 reaches stable: a rushed migration with no prior context, or
indefinite drift on a maintenance-only 1.x branch.

## Decision

**Stay on VitePress 1.6 while upstream 2.x is in alpha or release-candidate.**

Begin migration only when *all* of the following are true:

1. VitePress 2.x has a non-pre-release stable tag.
2. The VitePress 2 issue tracker has no open `regression` issues affecting
   sidebar/nav, search, or markdown extensions we use.
3. Mermaid renders correctly under VitePress 2 with our custom fence handler
   (see `docs/.vitepress/config.ts`, `markdown.config`).

When all three are met, run the migration on a `feat/vitepress-2-migration`
branch:

- [ ] Read the full VitePress 2 CHANGELOG for breaking changes since 1.6.
- [ ] Update `docs/.vitepress/config.ts` for the new `defineConfig` /
      sidebar / nav APIs.
- [ ] Re-validate the custom mermaid fence handler against the new markdown
      pipeline.
- [ ] Update theme overrides under `docs/.vitepress/theme/` if the v2 theme
      contract changed.
- [ ] `npm run dev` — local visual QA across Getting Started, Platform,
      Guides, MCP, Security, API and Reference sections.
- [ ] `npm run build` — clean build, no warnings.
- [ ] Deploy to a preview environment, full-site QA, then merge to main.

**Review cadence:** revisit this ADR at every new VitePress 2 alpha/rc, or
at minimum every six months.

## Consequences

- **+** Future maintainers inherit a documented plan with clear go/no-go
  criteria — no context loss when VitePress 2 finally stabilises.
- **+** Avoids both premature migration (chasing alphas) and indefinite
  drift on an unmaintained major.
- **−** mctl-docs cannot adopt VitePress 2-only features until the criteria
  are met. The migration diff grows with every minor release we skip.

## See also

- [VitePress 2 CHANGELOG](https://github.com/vuejs/vitepress/blob/main/CHANGELOG.md)

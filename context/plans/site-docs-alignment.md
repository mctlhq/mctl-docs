# Site and documentation alignment

Status: implementation in progress. Reviewed: 2026-10-15.

## Outcome

Align docs.mctl.ai with the Nuxt landing site while retaining VitePress search,
sidebar and readable articles. Publish shared header, container and wordmark
parameters through mctl-design and pin both consumers to the same release.
Audit every public documentation page against current implementation sources.

## Delivery

1. Add shared site tokens, bump the design system to 0.6.0 and publish immutable CSS.
2. Adapt Nuxt and VitePress to the shared contract: 80px header, 1400px outer
   container, 20px narrow-screen gutters, matching wordmark and navigation fonts.
   Retain documentation navigation and article width. Remove obsolete glows.
3. Audit all Markdown pages, including pages outside the sidebar, against API,
   MCP, portal, GitOps and agent sources. Record evidence and unresolved limits.
4. Regenerate LLM exports and verify builds, links and rendered responsive pages.
5. Merge through reviewed PRs, design first; verify deployed consumer pages.

## Boundaries

Keep existing engines and URLs. Do not implement the separate onboarding plan
or publish draft kubectl access as available. Never run destructive documentation
examples against production. A failed observation remains unknown.

## Acceptance

Shared CSS version and header geometry match on both sites. Search, mobile
navigation, anchor offsets, sidebar, code and Mermaid remain usable at 375,
768, 1440 and 1920px. Every public page has an audit disposition with source
commits. CI and current-head review gates pass before merging.

## Audit evidence

Source snapshots: API `b8203cf`, GitOps `0274faa02`, agents `7189793`,
Portal `12e8633`, Telegram `c23f388`, web `7f779f0`. The audit checks source
contracts; it does not certify live identity grants, tenant resources or feature
rollouts. No destructive examples were executed.

| Public page | Disposition and source evidence |
|---|---|
| index | Updated positioning, removed fixed tool count and blanket promises; API MCP registry |
| getting-started/index | Rewritten request/access/deploy sequence; web onboarding plan, API MCP handlers |
| platform/overview | Qualified GitOps and isolation boundaries; operation registry and GitOps templates |
| platform/architecture | Corrected API/portal control paths; API router and workflow templates |
| platform/components | Added docs/design; removed obsolete count and web connector path; repository sources |
| guides/first-user-checklist | Separated provisioned tenant from human access; web onboarding plan and auth handlers |
| guides/deploy-first-app | Correct workflow tracking and readiness; deploy registry and status handler |
| guides/tenants | Async creation, API quota defaults and owner deletion; operations/registry.go |
| guides/services | Repository/tag deployment, configuration, HPA, retirement; MCP server and registry |
| guides/scaffolding | Fixed Python health check/dependency copy, local anchors, qualified image claims; deploy contract and Dockerfile commands. Container examples not executed |
| guides/gitops-workflows | Correct service paths and CI flow; GitOps services and workflow templates |
| guides/domains | Register/verify/provision sequence; handlers_domains.go and MCP verify handler |
| guides/databases | DB_* injection rather than automatic DATABASE_URL; wft-provision-database.yaml |
| guides/previews | Removed timing promises and repo-specific CI assumption; preview handlers/templates |
| guides/scaling | HPA contract and namespace quotas; MCP scale and resource usage handlers |
| guides/rollbacks | Explicit image tag and configuration boundary; rollback workflow. Qualified agent remediation |
| mcp/overview | Discovery, auth and persistence corrected; MCP registry and auth implementation |
| mcp/connecting | Retained OAuth URL-based setup and shared setup component; client-specific live sign-in not exercised |
| mcp/tools-reference | Replaced stale catalog with all 92 registered methods at API snapshot, source links and annotation semantics |
| mcp/examples | Correct deployment, quotas, HPA and preview identifiers; MCP schemas |
| human-input/architecture | Removed obsolete unimplemented statuses; investigator, DevLoop, API and GitOps continuation code |
| human-input/semantics | TTL and answered marker corrected; human_input.py and investigator |
| human-input/agent-authors | Draft/seal boundary, capability gate and continuation corrected; run_issue_investigator.py |
| human-input/surface-adapters | Updated source status; API response handlers, Portal backend route allowlist, Telegram internal/humaninput |
| human-input/surface-identity | Updated implementation status; surface relay handlers. Deployment remains unverified |
| security/authentication | Identity/access modes and refresh storage corrected; OAuth/auth handlers |
| security/authorization | Role matrix, enforcement modes and CI credential scope; registry, tenant_role.go and auth |
| api/index | Scoped endpoint subset, CI OIDC and role example; API router and schema |
| reference/faq | Removed fixed counts and blanket storage/license/isolation claims; core sources above |
| reference/troubleshooting | Correct failed reads, probes, DB variables, domain verification and review gates; API and workflow templates |
| reference/telemetry-attributes | Separated catalog status from deployment; tracing.py, Telegram audit_span.go, Collector template. Production export not asserted |
| reference/glossary | Correct workflow-backed operation tracking; operation registry |
| reference/diagrams | Mermaid version matches lockfile; architecture Mermaid rendering verified in browser. Full gallery not individually exercised |

## Validation and delivery

- Design build, lint, typecheck and version checks pass; current-head Claude
  review on design PR #89 has no P1/P2 findings.
- Nuxt generate and VitePress build pass. LLM export regenerated from 33 pages.
- Local previews use the exact generated 0.6.0 CSS served from the design
  worktree; production URLs remain pinned to ui.mctl.ai/0.6.0.
- Browser checks: 375px mobile home/menu; 768px article/search; 1440px and
  1920px desktop articles, sidebar and Mermaid; landing at all four widths.
  Header is 80px. At 1440px logo x=20, at 1920px x=260 in both sites.
  No document horizontal overflow observed at the checked widths.
- A generated-HTML link/anchor scan found two pre-existing scaffolding anchors;
  both corrected. Final scan: 34 HTML pages, zero missing local pages or anchors.
- Merge/deployment blocked by design dependency audit. Existing dependency
  chains include braces <=3.0.3 (GHSA-vfj7-8cjw-p6xm) and sprintf-js <=1.1.3
  (GHSA-hp3w-g68c-fv3c), with no patched version in the audit response, plus
  fixable advisories. Resolving this requires a separate dependency remediation;
  the audit gate was not weakened. Consumers must not merge before 0.6.0 CSS
  is published. Live post-deploy validation is pending that prerequisite.


## Full foundations pass (2026-10-15)

User approved extending the design system as the shared base for both public
sites. Changes extend the unreleased 0.6.0 contract; published 0.5.0 bytes remain
untouched. Existing product/editorial text recipes and compact MNav remain
compatible. Public site shells are demonstrated separately in Storybook.

- Added public text roles (marketing, UI, code and reading), the missing 800
  weight, control/disabled colors, status tints, overlay and grid semantics.
- Applied the shared scale across landing components, privacy/docs routes,
  VitePress overrides and MCP setup. Prose stays 16px/28px with 32/24/20px
  headings. Engine-specific spacing and navigation remain adapter concerns.
- Replaced remaining legacy blue form/header backgrounds, unrelated feedback
  colors and literal shadows. Color literals remain only as matching CDN
  fallbacks, browser theme metadata, alpha masks or third-party logo artwork.
- Mermaid reads concrete colors and font values from the loaded semantic CSS;
  architecture groups use semantic accent/status colors. Examples that teach
  explicit diagram styling retain their authored colors.
- Added Foundations/Public Sites with dark/light scoped examples, and extended
  Foundations/Typography with all public roles. The 1400–1439px gutter gap is
  removed in both adapters.
- Addressed documentation review: remaining workflow-name/storage overclaims,
  meaningful MCP descriptions with per-tool source line anchors, stale API
  human-input rollout statement and LLM index wording.
- Dependency patch updates remove fast-uri, brace-expansion, source-map-js and
  Vue renderer advisories. Audit still reports braces and sprintf-js without
  patched releases, postcss-selector-parser requiring a major upgrade, and a
  low-severity esbuild advisory. No policy exceptions were introduced.

Validation: token/type/CSS builds, lint, typecheck, Storybook build, Nuxt generate,
VitePress build and local page/anchor scan (34 pages, zero errors). Public token
reference scan resolves all actual declarations (excluding explanatory comments).
Browser matrix and final PR review results are recorded after verification.

### Verification follow-up (2026-10-16)

- Browser checks: home pages at 375, 768, 1440 and 1920px; no horizontal
  document overflow, shared 80px headers. Privacy and legacy docs routes also
  fit 375px. Mobile navigation opens; documentation search returns results;
  Mermaid expansion opens a labelled dialog and closes correctly.
- Scoped Storybook dark/light examples resolve their own background and header
  colors. Reading text computes to Onest 16px/28px. Documentation hero spans
  compute to Onest 800, 56px/64.4px on desktop.
- Version/license checks pass. Latest dependency audit: one high (braces), two
  moderate (sprintf-js, postcss-selector-parser), one low (esbuild). Publication
  and downstream merges remain blocked; no audit exception or bypass applied.
- Local previews use local generated 0.6.0 assets through a temporary server;
  committed consumer URLs remain pinned to the production versioned CDN.

### Review hardening (2026-10-16)

- Added explicit dark scoping and focus-ring recomputation in the design system.
  Browser verification with Storybook's root switched to light confirms the
  dark panel stays dark and the light panel stays light.
- Consumers retain pinned 0.6.0 token values as declaration fallbacks, so a CDN
  failure preserves the shared appearance. Input text has an explicit 16px
  minimum to prevent iOS focus zoom. Normal rendering still uses shared tokens.
- Mermaid has palette/font fallbacks and displays source if rendering fails;
  supporting nodes retain a distinct muted style.
- Deliberate local CDN 503 test: docs still render the architecture SVG and
  Onest 32px/40px title; web keeps its fluid hero, opaque field backgrounds,
  visible borders and 16px input text. Both production builds pass.

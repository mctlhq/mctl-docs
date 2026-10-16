# Site and documentation alignment

Status: released and production-verified on 2026-10-16.
Earlier blocker notes below are historical; see the release record at the end.

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

### Release record (2026-10-16)

- Design #91 removed the Tailwind 3 / old selector-parser dependency paths and
  documented a maintainer-approved build-only sprintf-js audit exception.
  Design #89 then merged with green CI. Follow-up #90 published design 0.7.0;
  this initiative intentionally retains its reviewed immutable 0.6.0 contract.
- All three implementation PRs passed current-head review with no open P1/P2.
  Web #143 and docs #146 merged; release PRs web #141 and docs #143 also passed
  CI and review before merging. Tags: web 7.7.0 and docs 0.1.49.
- Centralized release-deploy runs 38876119333 (web) and 38876079976 (docs)
  succeeded. Both services report Synced / Healthy at the released image tags.
- The three public 0.6.0 CSS assets match origin/main byte-for-byte. Live pages
  at mctl.ai and docs.mctl.ai load versioned 0.6.0 CSS and Onest 800.
- Production browser comparison at 1728px: both headers are 80px tall, with
  identical neutral background at 80% opacity. Both wordmarks measure
  78.046875 x 24px at x=164, y=27.5, use Onest 800 24px/24px with 2px tracking,
  text rgb(230,231,233) and accent rgb(226,90,60). Neither home page overflows.
- Prior responsive and interaction checks remain recorded above. Remaining P3
  cleanup and adoption of design 0.7.0 are follow-ups, not release blockers.

### 0.7.0 follow-up (2026-10-16, completed)

Adopt published immutable 0.7.0 CSS in both consumers, including fallback
contrast colors. Unify Mermaid link handling across inline and expanded SVGs;
cover relative and malformed URLs without triggering expansion. Consolidate
font fallbacks, remove redundant styling and glows, and make container gutters
independent of the desktop breakpoint. Retain the shared prose-title fallback
of 32px intentionally: it matches the role rather than the old page-specific
clamp. Repeated human-input availability notices remain on standalone pages
so direct readers see the limitation. Validate builds, link handling, mobile
navigation/search, diagrams and the published release before closing.

Local validation: both production builds pass; four link-handler tests pass
and run as part of the docs build; 34 generated HTML pages have zero broken
internal links/anchors. Browser checks cover both consumers at 375/768/1440/1920
without horizontal overflow, mobile menus, docs search results, expanded
Mermaid link confirmation and closing both dialogs. Published 0.7.0 CSS and
prose assets match the design repository byte-for-byte.

Release verification:

- Web #145 and docs #149 merged after current-head reviews. Docs #149's P2
  was fixed in `2a89801`: restore the core Mermaid group in inline and
  expanded diagrams. Claude reported no P1/P2/P3; all CI checks passed.
- Release PRs web #146 and docs #148 merged. Published tags are web `7.7.1`
  and docs `0.1.50`, both consuming immutable design `0.7.0` assets.
- Centralized release-deploy runs `38906587446` (web) and `38907392057`
  (docs) succeeded. Production pages load the versioned 0.7.0 CSS; the
  architecture page's published CSS contains both core-group selectors.

## Functional follow-up verification (2026-10-16)

These checks follow the completed design release; they do not change its status.

- Dependency audit: design PR #93 replaces `vite-plugin-dts` / API Extractor
  with `vue-tsc` and `rollup-plugin-dts`. `sprintf-js` is absent from the
  resolved tree and the moderate audit passes without GHSA exceptions. Build,
  lint, typecheck, component tests and Storybook pass. A published-declaration
  consumer check rejects invalid component props; replacing declarations with
  `any` deliberately fails that check. Merge/release verification is pending.
- Live OAuth: the current Codex/ChatGPT MCTL connection successfully calls
  `mctl_whoami` as `mashkovd`. Reconnecting the existing Claude connector reaches
  the ZITADEL callback but is refused because its identity owns a separate
  principal. Source principal `prn_01M51RRWSHH3VR3W4RTYY9238K` and existing
  `mashkovd` principal `prn_01M39HRB7JRXZ2PHW5VVB695YZ` are both active human
  principals. No merge was performed. The documented admin merge moves live
  identities and disables the source, so the account owner must decide and a
  human admin must perform it. Other named clients have not been exercised.
- Human input: API 4.90.0, Portal 4.21.0 and Telegram 0.79.5 are deployed.
  Both API surface-token references are set; the database contains one active
  link for each of Telegram and Portal, plus one accepted human-input delivery.
  Telegram preview enables `HUMAN_INPUT_ENABLED`; production did not. GitOps
  PR #1911 enables production's existing adapter. Rollout verification pending.
- Telemetry: the live Collector exports to the evaluation Tempo backend.
  Synthetic trace `6f466393cdb00be8225a9404fd9c6502` was submitted over OTLP
  and retrieved from Tempo: `gen_ai.usage.input_tokens` stays integer `17`,
  `mcp.tool.arguments` becomes `****`, cluster/environment attributes are added.
  Execution workers already enable bounded DevLoop tracing, while the control
  worker did not. PR #1911 completes that wiring. Both live CWFTs declare
  `traceparent`, require a sampled parent and configure OTLP; the live API
  operation registry declares `traceparent`. Synthetic export establishes
  pipeline/redaction behavior, not organic DevLoop end-to-end correlation.

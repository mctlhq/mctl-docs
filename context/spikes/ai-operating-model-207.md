# Spike: AI operating model adoption guidance outline (mctl-docs#207)

Status: research note, proposed only. Not published guidance. Owner decision is
required before any follow-up is implemented.

Issue: mctlhq/mctl-docs#207. Branch: `docs/ai-operating-model-207`.
Allowed change: this file only. No published docs, config, code or tests changed.

## Question

Which elements of Docusign's AI operating model (metrics, governance, rollout)
should MCTL docs recommend to customers adopting governed agents?

## Verdict (proposed, pending owner approval)

**REUSE_EXISTING, with an optional small GUIDANCE_OUTLINE follow-up.**

Reasons:

1. For the issue's four question areas (decision owner, bounded rollout,
   denominator-aware metrics, incident/rollback boundaries), the pages I read
   already state some related controls: role-gated writes, bounded previews,
   explicit-tag rollback and its limits, and a human-input/approval separation.
   See the inventory below. Which controls the article itself would ask for is
   unknown, because the article was NOT_OBSERVED.
2. Some areas are not described in the pages I read: denominator-aware adoption
   metrics and a staged customer rollout programme. Absence from the examined
   pages does not show the capability is absent from MCTL, and it does not show
   whether closing the gap needs documentation, product work or neither. Those
   are unknowns for the owner. A guide must not present them as available
   without a cited source.
3. The article is general and low urgency, and it was not read in this spike
   (see Evidence limits). It cannot be evidence of MCTL behaviour.

A docs-only follow-up is optional and small: one "adoption checklist" page that
links to existing pages and labels each item documented / customer-owned /
not documented. If the owner prefers, DEFER with no change is also valid.

## Evidence limits

- Article: https://thenewstack.io/docusign-ai-engineering-adoption/ was **NOT_OBSERVED**.
  This task forbade network access. Nothing below describes the article's
  content. "Docusign" appears here only as the issue's framing. The comparison is
  between the issue's four question areas and MCTL sources.
- Only this repository's docs and alignment register were read, at `origin/main`
  after `git fetch origin`. No current implementation source and no live
  deployment were read or inspected. Cross-repo sources (mctl-agents, mctl-api,
  mctl-gitops, .github) were **not** read; claims that depend on them are marked
  UNKNOWN or "as cited by the docs".
- The alignment register `context/plans/site-docs-alignment.md` records
  historical audits at snapshots (API `b8203cf`, GitOps `0274faa02`, agents
  `7189793`, Portal `12e8633`, Telegram `c23f388`, web `7f779f0`). I did not
  repeat them. A historical audit is not proof of current source or production
  behaviour, and it did not cover live grants, tenant resources or rollouts.
- No experiment was run. No production reads, model calls or customer data.
  The issue's "required experiment" is answered as a design only (see below).
- Pages I did not read in full: `mcp/*`, `api/index`, `platform/architecture`,
  `platform/components`, `guides/services`, `guides/scaffolding`, `guides/domains`,
  `guides/databases`, `guides/gitops-workflows`, `human-input/surface-adapters`.
  Their content is UNKNOWN for this note.

## Labels used

- DOCS_VERIFIED: a published page in this repository states it. I read the
  page text (and the alignment register in `context/plans/site-docs-alignment.md`).
  I did not read current implementation source or inspect any live deployment.
  The claim is limited to "the docs say this".
- Historically source-audited: the alignment register records that an earlier
  audit compared the page to a named source commit. That is a past snapshot, not
  proof of current source or production behaviour, and I did not repeat it.
- PROPOSAL: something this note suggests; not adopted.
- INFERRED: my reading across pages; not stated verbatim.
- UNKNOWN: not observed.

## Inventory of published guidance (read in this spike)

| Area | Page | What it says (summary) | Label |
|---|---|---|---|
| Getting started | `getting-started/index.md` | Request, provisioning and sign-in are separate; a submitted request is not a ready workspace; connect MCP via OAuth, verify with `mctl_whoami`, onboard, then confirm workflow status, ArgoCD Synced/Healthy and an endpoint test | DOCS_VERIFIED |
| Readiness | `guides/first-user-checklist.md` | Checklist; operator confirms provisioning and account; ArgoCD, Argo Workflows, Vault, kubectl are separate grants | DOCS_VERIFIED |
| Deployment | `guides/deploy-first-app.md` | Eight steps; deployment is a workflow, not proof of readiness; health endpoints required; developer access needed | DOCS_VERIFIED |
| Tenancy | `guides/tenants.md` | Namespace, RBAC, quota; deletion needs owner and is irreversible; quota defaults depend on entry point | DOCS_VERIFIED |
| Authorization | `security/authorization.md` | Role matrix (viewer, developer, owner, platform admin); unknown roles refused; failed role lookup is an error, not a grant; legacy/shadow/principal identity modes; CI OIDC limited to the bound component | DOCS_VERIFIED |
| Authentication | `security/authentication.md` | OAuth 2.1 with PKCE; per-request token validation; refresh tokens stored as hashes for revocation; `AUTH_REQUIRED=false` is development-only | DOCS_VERIFIED |
| Bounded rollout units | `guides/previews.md` | Previews in `{team}-preview`, TTL default 24h via `ttl_hours`, fail-closed preview secrets, network allow-list | DOCS_VERIFIED |
| Autoscaling bounds | `guides/scaling.md` | HPA min/max/CPU threshold; quota usage is not per-pod telemetry | DOCS_VERIFIED |
| Rollback | `guides/rollbacks.md` | Explicit `target_tag`; new Git commit; does not restore env vars, secrets, other config or database state | DOCS_VERIFIED |
| Incident handling | `guides/rollbacks.md`, `reference/troubleshooting.md` | Agent-proposed remediation uses the configured incident workflow and approval policy; agent PRs need review/approval gates for current head; not every alert rolls back | DOCS_VERIFIED (policy details UNKNOWN) |
| Human input | `human-input/semantics.md`, `architecture.md`, `agent-authors.md`, `surface-identity.md` | Clarification is not approval; separate states and endpoints; max 3 rounds, 1 outstanding request, 7-day max TTL; first answer wins; audit entries carry ids only; kill switch is one reviewed gitops PR; surface principals have no general act-as authority | DOCS_VERIFIED; live rollout UNKNOWN per the pages' own status notes |
| Marketing-tone claims | `index.md`, `platform/overview.md` | "Self-Healing Agent", "Full Platform Control", "AI-native" | Marketing, not evidence. Do not cite as controls |
| Not available | `guides/kubectl.md` | Opt-in per user by platform admin; read-only narrow access. The alignment plan says not to publish draft kubectl access as available | Caution: do not recommend to customers as a default |

## Comparison: the issue's question areas versus MCTL

| Area | What MCTL docs already provide | Gap or caveat | Label |
|---|---|---|---|
| Decision owner | Roles gate writes (developer deploys/rolls back; owner retires/deletes; platform admin runs agent pipelines). Approval is a distinct path (`POST .../approve`) a human-input answer can never satisfy. Operator confirms provisioning and access | No page tells a customer to name an accountable human for agent-proposed actions or who holds the `approve` role in their org. Who may approve is not documented in the pages read (UNKNOWN) | DOCS_VERIFIED for roles and approval separation; PROPOSAL for a customer-side owner template |
| Bounded rollout | Previews with TTL and isolation; HPA bounds; quota; explicit-tag deploys and rollbacks; clarification rounds and TTL bounds; capability kill switch | No documented canary, percentage or per-user staged enablement of agent features for a customer. Blue-green is opt-in per rollbacks page. Whether the platform offers staged agent enablement is UNKNOWN | DOCS_VERIFIED for the listed bounds; UNKNOWN for staged agent rollout |
| Denominator and missingness-aware metrics | Human-input state carries `resume_count`, `rejected_count`, `timed_out`, `abandoned` outcomes and ids-only audit events; `mctl_get_resource_usage` reports quota usage. Telemetry reference exists (`reference/telemetry-attributes`, not read here) | No published page defines adoption metrics, denominators (eligible users, eligible tasks) or how to treat missing/unknown data. The `human_input` counters have per-execution scope; their use as customer metrics is INFERRED, not documented. Human-input audit entries carry ids only, so content quality cannot be derived from that source alone. This does not show that content-based quality measures are unavailable elsewhere; other authorised sources were not assessed, and no collection permission is granted by this note | UNKNOWN for adoption metrics; INFERRED for counter reuse |
| Incident, rollback, recovery boundaries | Rollback by explicit tag; GitOps history; ArgoCD reconciles; failed reads are errors, not grants (503 on role lookup is not a denial); human-input waits end in `timed_out` or `abandoned` and run no implementation | Rollback does not cover secrets, config or database state; no documented recovery guidance for those; no documented customer incident runbook for agent misbehaviour beyond the kill switch, which is a platform-operator action | DOCS_VERIFIED for the stated limits; UNKNOWN for customer runbooks |

## What existing docs already cover, and the unfilled space

Topics the pages I read already address, where new text could duplicate them:
identity and role model, readiness checks that distinguish
request/provisioning/sign-in, workflow status versus service health, rollback
scope and its limits, clarification vs approval, and surface identity linking.

Not described in the pages I read: staged enablement of agents per tenant or
user, adoption metrics, and customer-side incident ownership. Whether these
exist elsewhere, need product work or need documentation is unknown; this note
does not draft them and leaves the call to the owner. Overlap warning:
shared-assistant product and architecture belong to mctlhq/.github#309 (active
research); do not duplicate. mctl-agents#848 needs actual owner time and is out
of scope. mctl-agents#1014 has its own research PR; reuse its metric caveats by
reference and do not build a metrics framework here (the content of that PR was
not read in this spike, so no caveat is restated).

## Adoption guidance outline (PROPOSAL, not for publication as-is)

Every item either links to an existing page or is marked as a customer-owned
decision. Nothing claims an unverified MCTL control.

1. Decide who owns outcomes. Name an accountable owner per tenant for deploys
   and for approvals. Link: authorization roles, human-input semantics.
   Illustrative only: a team might map "owner" to a lead and "developer" to
   engineers; this is an example, not an observed customer setup.
2. Confirm readiness before enabling agents. Reuse the first-user checklist
   conditions (provisioned, signed in, role verified with `mctl_whoami`).
3. Start narrow. Use previews with a short `ttl_hours` and a non-critical
   service first. Label as customer practice; MCTL does not document a staged
   agent rollout mechanism.
4. Keep clarification and approval separate in the customer's own process.
   Link: semantics page. An answer never authorizes.
5. Define recovery before the first write. State that rollback restores the
   image tag only; require the customer to plan configuration, secret and
   database recovery separately. Link: rollbacks.
6. Decide what to measure and say what is unknown. See measurement design below.
7. Mark what is not documented: staged enablement, incident runbooks, approver
   assignment details. Point to the operator rather than guessing.

Illustrative readiness examples (hypothetical, not customer evidence):

- Role: "Alice is developer on `team-a`; Bob is owner and the only person who
  retires services." Check: `mctl_whoami` lists `team-a` for Alice.
- Rollback: "Before enabling agent-proposed changes, the team records the last
  known-good image tag and where its database migration state lives."

## Measurement design (proposal only; no real adopter data)

Falsifiable question: do customers following the outline show fewer
unverified-ready deployments than those who do not? This note does not run it.

Candidate measures, each with an explicit denominator and a missing-data rule:

| Measure | Numerator | Denominator | Missing/unknown handling |
|---|---|---|---|
| Verified readiness rate | Deploys with workflow complete, Synced/Healthy and endpoint 200 | All submitted deploys in window | Deploys whose status could not be read are reported as `unknown`, never counted as success or failure |
| Agent proposals reviewed | Proposals with a recorded human decision | Proposals created | Proposals without a record are `unknown` |
| Clarification completion | `answered` outcomes | Requests raised (answered + timed_out + abandoned + still waiting) | Waiting and unreadable states stay separate |
| Rollback frequency | Rollbacks executed | Deploys | Unreadable history is `unknown` |

Baseline versus candidate would compare success, cost, latency and reliability
(per the issue). Cost and latency sources for MCTL are UNKNOWN here. Unknown is
not zero in any table. Any real measurement needs owner approval, a defined
population and a source that exists; reuse the mctl-agents#1014 caveats rather
than new rules.

## Optional docs-only follow-up (PROPOSAL; requires owner approval)

Scope: one new page, `docs/guides/agent-adoption-checklist.md`, plus one sidebar
entry. No changes to existing page content.

Provisional file allowlist:

- `docs/guides/agent-adoption-checklist.md` (new)
- `docs/.vitepress/config.ts` (one sidebar entry; this is the provisional
  sidebar path, not a root `.vitepress/config.ts`)

Acceptance checks:

- Every control statement links to an existing published page or is labelled
  customer-owned or not documented.
- No sentence claims staged rollout, adoption metrics or incident automation as
  available without a cited source.
- Illustrative examples are labelled hypothetical; no customer results.
- Does not restate shared-assistant design from .github#309.
- `bun run build` (the existing `package.json` build script; there is no
  `docs:build`) passes and a link scan finds no broken internal links. This is
  for the future implementation only; no build or install was run for this
  research note.
- No emoji; English only; no change to `docs/public/` or LLM exports. The build
  may generate exports, so any generated-export diff must be reviewed
  explicitly and kept out of the change unless the owner approves it.

DEFER is equally valid: the existing pages already carry the controls, and the
article is low urgency.

## Unknowns

- Content of the Docusign article (NOT_OBSERVED).
- Who may call `approve` and how customers configure that (agents/API source not read).
- Any staged agent enablement or feature-flag mechanism per tenant.
- Whether production has the human-input surfaces enabled for a given customer.
- Source of cost and latency data for agent runs.
- The #1014 metric caveats and the .github#309 design (not read).

## Owner decisions needed

1. REUSE_EXISTING only, DEFER, or approve the single-page follow-up?
2. If approved, may the page cover items 3 and 7 as "customer practice / not
   documented", or must they wait for a product answer on staged rollout?

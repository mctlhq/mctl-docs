# Telemetry Attribute Catalog

The canonical list of attributes MCTL puts on OpenTelemetry spans, and how they
map onto upstream OpenTelemetry semantic conventions.

This page exists so that producers do not each invent their own names. A trace
is only useful if a DevLoop span, an agent diagnosis span and an MCP tool span
can be joined on the same keys, and that only happens if the keys are agreed
before the producers are written.

**Status of each attribute is stated explicitly.** An attribute is either
`shipped` — the emitting code is in production, with the source named — or
`reserved` — this catalog fixes the name, but no code sets it anywhere. Nothing
here is aspirational without being labelled as such.

One caveat that `shipped` does not cover: no MCTL service has a tracer, exporter
or propagator installed yet — that is the epic's own remaining work. The shipped
attributes are written onto a span only when one already exists in the context,
so today they are code that would emit rather than data in a backend. `shipped`
means the name is settled and renaming it costs a migration; it does not mean
anything is queryable yet.

## Ownership

| Concern | Owner |
|---|---|
| Attribute names, types, shapes — this page | `mctl-docs` |
| Collector enrichment and redaction | `mctl-gitops`, `platform-gitops/bootstrap/templates/observability/otel-collector.yaml` |
| What the control plane asserts about an execution, and the trust model | `mctlhq/mctl-agents#196` |
| Version identity fixed per run | `mctl-agents/docs/adr/007-agent-definition-execution-profile-contract.md` |
| Backend selection | `mctlhq/mctl-gitops#1280` |

This catalog fixes *names*. It does not decide which fields the control plane
is entitled to assert, nor how a workload is prevented from spoofing them —
that is `mctl-agents#196`, and the two are deliberately separate. A name can be
agreed now; the trust model is a design question that is still open.

## Naming rules

1. **Reuse an upstream convention when one exists.** If OpenTelemetry defines
   an attribute for the concept, use its name and its value shape. Do not mint
   an `mctl.*` alias for something that already has a standard name.
2. **Mint `mctl.*` only for concepts upstream does not model.** DevLoop
   executions, work items, agent release tuples and the Cloudflare edge route
   have no upstream equivalent. `mctl.` is the only prefix MCTL owns.
3. **Namespace by concept, not by producer.** `mctl.execution.id`, not
   `mctl.agents.execution_id`. Two services emitting the same concept must emit
   the same key.
4. **Dots separate levels, underscores separate words within a level.**
   `mctl.work_item.id`, not `mctl.workItem.id` or `mctl.work-item.id`.
5. **Singular subject.** `mctl.repository.name`, never `mctl.repositories.name`.
6. **Identifiers end in `id`; human-readable names end in `name`.** If both
   exist, emit both rather than overloading one. A leaf may be `_id` when the
   identifier qualifies a sub-entity of the level above it — `mctl.workflow.run_id`
   is the id of a *run* of that workflow, not of a separate `run` entity, and
   `mctl.edge.request_id` likewise. Upstream has the same shape (`k8s.pod.uid`).
   Promote it to its own level only when the sub-entity gains attributes of its
   own.
7. **Units in the key for anything measured**, following upstream practice
   (`.duration` in seconds as a float, `.count` as an integer). Do not encode a
   unit in the value.
8. **Booleans read as an assertion**, e.g. `mctl.approval.required`, so that
   `true` needs no further explanation.

### Upstream namespaces deliberately not adopted

Rule 1 says reuse an upstream convention when one exists. Three near-misses are
worth naming explicitly, so the next producer does not read the tables below as
a counter-example to the rule:

| MCTL attribute | Nearest upstream | Why MCTL keeps its own |
|---|---|---|
| `mctl.repository.name` | `vcs.repository.name` (release candidate) | Not the same value. Upstream's is the bare repository name and its own note warns it "can clash with forks of the same repository if collecting telemetry across multiple orgs". MCTL carries the qualified `owner/repo`, which is a different field. |
| `mctl.pr.number` | `vcs.change.id` (release candidate) | The same concept, and the one real candidate for adoption. MCTL keeps its own for now because an integer is the natural type for a PR number and upstream's is a string, and because `vcs.*` is not stable — adopting a release-candidate name into a catalog whose whole purpose is to stop renames would be self-defeating. This is the row most likely to change at the re-review below. |
| `mctl.user.id` | `user.id` | MCTL distinguishes two people that `user.id` collapses: `mctl.user.id` is the upstream principal a call *ran as*, `mctl.actor.id` is the human who *triggered* the execution. One upstream key cannot carry both. |

Re-review this table when `vcs.*` reaches stable — that is the trigger, and
nothing checks it automatically.

## Resource attributes

Resource attributes describe the *producer*, not the operation, and are set
once per process. Several are added by the Collector, so a producer that omits
them still gets them.

| Attribute | Set by | Status | Notes |
|---|---|---|---|
| `service.name` | producer | shipped (required) | Upstream convention. The one resource attribute a producer must set itself; nothing can infer it reliably. |
| `k8s.namespace.name` | Collector, `k8sattributes` | shipped | |
| `k8s.pod.name` | Collector, `k8sattributes` | shipped | |
| `k8s.node.name` | Collector, `k8sattributes` | shipped | |
| `k8s.deployment.name` | Collector, `k8sattributes` | shipped | |
| `mctl.team` | Collector, from pod label `mctl.ai/team` | shipped | The same pair promtail relabels for logs, so a trace and a log line for one pod carry matching tenant identity with no mapping table. |
| `mctl.component` | Collector, from pod label `mctl.ai/component` | shipped | As above, from `mctl.ai/component`. |
| `k8s.cluster.name` | Collector, `resource` processor | shipped | `action: insert`, so a producer that sets it wins. |
| `deployment.environment` | Collector, `resource` processor | shipped, **deprecated spelling** | `action: insert`, same rule. Upstream replaced this key with `deployment.environment.name`, which is `stable`. A producer setting it itself — which `insert` explicitly invites — should be aware it is writing the deprecated name. Moving the Collector is `mctlhq/mctl-gitops#1332`. |

The `insert` semantics matter: the Collector never overwrites a producer's
value for these two. A producer that knows better — a workload running for one
tenant environment inside a shared cluster, say — may set them and will not be
rewritten.

## Span attributes — correlation identity

These are the join keys. They are what makes one DevLoop visible as a single
trace, and they are the attributes every producer in the epic must carry.

| Attribute | Type | Status | Meaning |
|---|---|---|---|
| `mctl.execution.id` | string | reserved | The canonical execution identifier. Semantics owned by `mctl-agents#196`; today the nearest durable value is `attempt.id` in a DevLoop `.status.yaml`. |
| `mctl.workflow.id` | string | reserved | Temporal workflow id, e.g. `dev-loop-mctlhq-mctl-telegram-617`. |
| `mctl.workflow.run_id` | string | reserved | Temporal run id. Distinguishes retries of one workflow id. |
| `mctl.workflow.type` | string | reserved | `investigate`, `implement`, and so on. Low cardinality — safe to group by. |
| `mctl.argo.workflow.name` | string | reserved | The Argo workflow that executed one activity, as stored on the `ExecutionRecord`. |
| `mctl.work_item.id` | string | reserved | Roadmap work item id, e.g. `attribute-catalog`. Joins a trace to the roadmap graph. |
| `mctl.epic.name` | string | reserved | Epic manifest name, e.g. `observability`. |
| `mctl.agent.name` | string | reserved | `investigator`, `implementer`, `shepherd`, … |
| `mctl.repository.name` | string | reserved | Full name, `mctlhq/mctl-telegram`. Never a URL. |
| `mctl.issue.number` | int | reserved | Issue the execution is acting on. |
| `mctl.pr.number` | int | reserved | Pull request the execution produced or is acting on. |
| `mctl.actor.type` | string | reserved | `github_user`, `service`, `schedule`. Bounded set. |
| `mctl.actor.id` | string | reserved | Who triggered it. Subject to the privacy rules below. |
| `mctl.trigger.type` | string | reserved | `github_issue`, `github_comment`, `schedule`, `manual`. |

Trace and span identifiers are **not** in this table on purpose: `trace_id` and
`span_id` are part of the OTLP envelope, not attributes. Copying them into an
attribute creates a second correlation scheme, which is the thing
`mctlhq/.github#55` exists to prevent.

## Span attributes — version identity

Fixed per run by ADR-007. These make a trace answer "what exactly ran", not
just "which service ran".

| Attribute | Type | Status | Meaning |
|---|---|---|---|
| `mctl.agent.definition_version` | string | reserved | From the resolved release tuple. |
| `mctl.agent.profile_version` | string | reserved | From the resolved release tuple. |
| `mctl.agent.release_revision` | string | reserved | The binding revision the tuple was resolved through. |

ADR-007 pins all three atomically — there is no half-promotion — so a span
carrying one of them must carry all three. A span with a definition version and
no profile version describes a state the control plane does not produce.

## Span attributes — edge and MCP identity

These are shipped today, by `mctl-telegram` `internal/mcp/audit_span.go`, from
the same values already written to the audit row.

| Attribute | Type | Status | Meaning |
|---|---|---|---|
| `mctl.edge.request_id` | string | shipped | The `Cf-Ray` of the leg that reached the upstream. |
| `mctl.edge.route` | string | shipped | `portal` or `direct`, decided by the presence of `Cf-Worker`. Unforgeable: Cloudflare strips client-supplied `Cf-*` at the edge. |
| `mctl.tool.name` | string | shipped | The MCTL tool invoked. |
| `mctl.tool.status` | string | shipped | Outcome of the tool call. Bounded set. |
| `mctl.user.id` | int | shipped | The upstream principal the call ran under. |
| `mcp.method` | string | shipped, **non-conforming** | See the divergence table. |
| `mcp.name` | string | shipped, **non-conforming** | See the divergence table. |
| `mcp.protocol_version` | string | shipped, **non-conforming** | See the divergence table. |

An attribute that was not captured is **omitted rather than written empty**.
An absent attribute is itself information; an empty one is a value that reads
as a measurement and is not one. Note this is a producer-side rule about what
the code sets — the Collector's redaction never removes an attribute, so an
absence in a backend is always the producer's decision, never redaction's.

## OpenTelemetry mapping

Upstream defines MCP attributes in the `mcp.*` namespace. Three shipped MCTL
attributes occupy that namespace with different spellings, which is worse than
either conforming or using `mctl.*`: a consumer configured for the upstream
convention sees nothing, and a consumer configured for MCTL sees names that
look standard but are not.

| Shipped today | Upstream convention | Disposition |
|---|---|---|
| `mcp.method` | `mcp.method.name` | Rename to the upstream name. |
| `mcp.protocol_version` | `mcp.protocol.version` | Rename to the upstream name. |
| `mcp.name` | *(no counterpart)* | **Drop** — `mctl.tool.name` is already shipped by the same helper and already carries this value, so nothing is lost and the dual-emit rule below does not apply. The `mcp.*` namespace is upstream's; MCTL should not extend it. |
| *(not emitted)* | `mcp.session.id` | Reserved. Only meaningful on the legacy `2025-06-18` path, which mints a session; the modern `2026-07-28` path mints none. |
| *(not emitted)* | `mcp.resource.uri` | Reserved. Subject to the privacy rules — a resource URI can carry a document path. |

Renaming shipped attributes is a code change in `mctl-telegram` and is **not**
part of this catalog. It is tracked as `mctlhq/mctl-telegram#658`.

Two caveats a reader should have before treating upstream as settled:

- Both the `mcp.*` and `gen_ai.*` registries have **moved out** of
  `open-telemetry/semantic-conventions` into
  `open-telemetry/semantic-conventions-genai`. The entries left behind in the
  original repository are marked deprecated purely because of the move.
- Both namespaces are still marked development, so names can change. That is
  precisely why MCTL pins a reviewed catalog with an explicit re-review trigger
  rather than tracking upstream implicitly.

For model calls, use `gen_ai.*` as upstream defines it — in particular
`gen_ai.operation.name`, `gen_ai.provider.name`, `gen_ai.request.model`,
`gen_ai.usage.input_tokens` and `gen_ai.usage.output_tokens`. Note that
`gen_ai.usage.prompt_tokens` and `gen_ai.usage.completion_tokens` are the
deprecated spellings; use the `input`/`output` pair. Upstream defines **no**
cost or price attribute, so cost attribution — `.github#48` Phase 1 — is
computed from the token counts downstream, not emitted as an attribute.

| Attribute | Type | Status | Meaning |
|---|---|---|---|
| `gen_ai.operation.name` | string | reserved | Upstream convention, e.g. `chat`, `invoke_agent`. Bounded. |
| `gen_ai.provider.name` | string | reserved | Upstream convention. Bounded. |
| `gen_ai.request.model` | string | reserved | The concrete model. Bounded, and the dimension cost is grouped by. |
| `gen_ai.usage.input_tokens` | int | reserved | Token count in. Currently masked — see the warning below. |
| `gen_ai.usage.output_tokens` | int | reserved | Token count out. Currently masked — see the warning below. |

All five are `reserved`: no MCTL service emits `gen_ai.*` today.

::: warning Token counts do not currently survive the Collector
The redaction pattern reproduced below matches any key containing `token`, so
`gen_ai.usage.input_tokens` and `gen_ai.usage.output_tokens` are **masked
before export** today — as are both deprecated spellings. There is no spelling
of a token counter that survives.

Masked, not dropped, and for an integer counter that is worse: the attribute
arrives with its value replaced by the string `****`, so a consumer gets a
present key of the wrong type rather than a missing one.

The intent of that pattern is credential shapes, not usage counters, so this is
a configuration defect rather than a policy: tracked as
`mctlhq/mctl-gitops#1332`. Nothing is broken in production yet because no
producer has a tracer wired.

Emit the attributes under these names anyway — they are the correct names, and
the Collector is what has to change. But **do not build cost attribution on
them until `mctl-gitops#1332` is closed**, because until then no usable count
reaches the backend and nothing reports an error.
:::

## Privacy

**These rules are enforced, not advisory.** The Collector's `redaction`
processor runs on every trace before export. The patterns below are reproduced
from the deployed configuration:

```
(?i).*(authorization|cookie|api[-_]?key|token|secret|password|credential).*
(?i)^vault\..*
(?i)^gen_ai\.(prompt|completion).*
(?i).*\.messages$
(?i)^mcp\.tool\.(arguments|result)$
^db\.statement$
^http\.(request|response)\.header\..*
```

Credential *shapes* are additionally masked by value, regardless of the key
they appear under: GitHub tokens, `sk-` keys, Vault `hvs.` tokens and JWTs.
Only the matching part of the value is replaced, so the rest of a longer string
survives.

### What "redacted" actually does here

Worth being exact: the processor can either **delete** an attribute or **mask**
its value, and the deployed configuration only ever masks.

- **Nothing is deleted.** Deletion happens only to attributes missing from
  `allowed_keys`, and the deployed config sets `allow_all_keys: true`, which
  disables that path entirely.
- **A key matching `blocked_key_patterns` survives with its value replaced** by
  `****`. The attribute is still on the span.
- **A non-string value is destroyed, not preserved.** The mask is written back
  with `SetStr`, unconditionally, so an integer attribute that matches a blocked
  pattern reaches the backend as the string `****` — value and type both gone.
  This is **not** governed by `redact_all_types`: that flag only changes how the
  value is *read* for the value-matching path, and since `hash_function` is
  unset the mask is the fixed string `****` whatever the value was. Turning
  `redact_all_types` on would change nothing here.
- **There is no diagnostic trail.** `summary` is unset, which is neither `info`
  nor `debug`, so the processor adds no count and no list of what it touched.

The consequences for a producer:

- **Never place meaningful data under a blocked name.** It will arrive as
  `****`, and nothing will report that it was replaced. A consumer sees a
  present attribute with a plausible-looking masked value, which is harder to
  notice than an absent one.
- **Prompts, completions and message bodies are out of traces by default.**
  `gen_ai.input.messages` and `gen_ai.output.messages` both match
  `.*\.messages$` and are masked. This is the epic's success criterion
  "private prompts, completions and Telegram message bodies remain out of
  traces by default", implemented rather than promised.
- **Tool arguments and results are out.** `mcp.tool.arguments` and
  `mcp.tool.result` are masked. If a tool's *shape* is worth measuring, emit a
  bounded derived attribute — an argument count, a result status — not the
  payload.
- **Redaction is a backstop, not a design.** It catches names nobody has
  invented yet, which is why it uses patterns rather than an exact key list.
  A producer must still not collect what it does not need.
- **The first pattern is currently broader than its intent.** `.*token.*`
  catches `gen_ai.usage.input_tokens` and `gen_ai.usage.output_tokens` along
  with the credentials it is aimed at. See the warning above and
  `mctlhq/mctl-gitops#1332`. This is the one place where what is enforced and
  what is intended differ, and it is recorded rather than glossed.

Personal data deserves its own line. `mctl.actor.id` and `mctl.user.id`
identify a person. They are permitted because an audit trail that cannot name
the actor is not an audit trail — but they must be the *platform's* identifier
(a GitHub login, an internal user id), never an email address, a phone number
or a Telegram handle, and never a customer's end-user identifier.

## Cardinality

Attribute cardinality decides whether a backend can index a field or merely
store it. Three classes:

**Bounded — safe to group and aggregate by.**
`mctl.workflow.type`, `mctl.agent.name`, `mctl.actor.type`,
`mctl.trigger.type`, `mctl.edge.route`, `mctl.tool.name`, `mctl.tool.status`,
`mctl.repository.name`, `mctl.epic.name`, `mctl.work_item.id`, the three
version-identity attributes (`mctl.agent.definition_version`,
`mctl.agent.profile_version`, `mctl.agent.release_revision` — a release tuple
is bounded and changes only on promotion, so grouping by it is exactly the
intended use), the MCP method and protocol version under **both** spellings —
`mcp.method` and `mcp.protocol_version` as shipped today, `mcp.method.name` and
`mcp.protocol.version` after `mctlhq/mctl-telegram#658` — `mcp.name`, which is
bounded because it duplicates `mctl.tool.name`, though group by
`mctl.tool.name` instead since `#658` removes this one — the four bounded
`gen_ai.*` attributes above, and every resource attribute. Each has a small,
slowly-changing domain.

**Unbounded but necessary — join keys, not grouping keys.**
`mctl.execution.id`, `mctl.workflow.id`, `mctl.workflow.run_id`,
`mctl.argo.workflow.name`, `mctl.edge.request_id`, `mctl.issue.number`,
`mctl.pr.number`, `mctl.actor.id`, `mctl.user.id`, `mcp.session.id`. These are
one-per-execution by design. Use them to retrieve a trace, never as a dashboard
dimension.

`gen_ai.usage.input_tokens` and `gen_ai.usage.output_tokens` are neither: they
are *measurements*, not dimensions and not join keys. Aggregate them, never
group by them.

**Must not become attributes.** Anything unbounded that is not a join key:
timestamps already carried by the span, free-form messages, commit diffs, file
contents, retry counters that belong in metrics, and full URLs where a
repository name and a number carry the same information in bounded form.

One volume note: the Collector already drops `/healthz` and `/readyz` spans
outright. Do not work around that by renaming a health endpoint.

## Changing this catalog

Adding, renaming or removing an attribute is a reviewed change to this page,
in its own pull request, referencing the epic. Specifically:

- **Adding** a `reserved` attribute requires the concept to have no upstream
  equivalent — rule 1 — and to be a join key or a bounded dimension, not a
  payload.
- **Promoting** `reserved` to `shipped` requires naming the producer and the
  file that emits it, in the same change that ships it.
- **Renaming** a `shipped` attribute is a breaking change for anything querying
  it. Emit both names for one release, then remove the old one; do not rename
  in place.
- **Re-review upstream** when the `semantic-conventions-genai` registry marks
  `mcp.*` or `gen_ai.*` stable, or when any name used here changes there. That
  is the explicit trigger; nothing tracks it automatically.

## References

- Epic: `mctlhq/.github#55` — vendor-neutral execution tracing
- Telemetry gateway: `mctlhq/mctl-gitops#902`
- Execution identity and trust model: `mctlhq/mctl-agents#196`
- Release tuple: `mctl-agents/docs/adr/007-agent-definition-execution-profile-contract.md`
- Edge correlation contract: `mctlhq/mctl-telegram#617`
- Backend selection: `mctlhq/mctl-gitops#1280`
- Collector redaction and `deployment.environment` defects: `mctlhq/mctl-gitops#1332`
- `mcp.*` rename: `mctlhq/mctl-telegram#658`
- Collector configuration: `mctl-gitops`, `platform-gitops/bootstrap/templates/observability/otel-collector.yaml`
- Upstream: <https://github.com/open-telemetry/semantic-conventions-genai>

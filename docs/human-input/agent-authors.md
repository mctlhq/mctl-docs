# Human Input: Agent Author Guide

This guide is for authors of DevLoop agents and execution profiles: how an agent becomes eligible to ask a human, what it must produce, and what the continuation run receives. The contract is [ADR 013](https://github.com/mctlhq/mctl-agents/blob/main/docs/adr/013-human-input-contract.md); the code of record is [`orchestrator/human_input.py`](https://github.com/mctlhq/mctl-agents/blob/main/orchestrator/human_input.py).

::: info Implementation status (source audit: 2026-10-15)
The request producer, Temporal consumer, response API and surface relay are implemented. The investigator seals model-authored drafts and consumes accepted answers; the GitOps investigate template declares the continuation parameter. Telegram has an adapter, and Portal has backend routes for human input. Availability in a particular installation depends on its deployed versions, surface credentials and identity links; this source audit does not establish live rollout status.
:::

## The `human.request_input` capability

`human.request_input` is a **capability entry**, not an SDK tool. The model never sees it as a callable tool.

- It is declared in an ExecutionProfile's `spec.tools`, next to real tool names.
- mctl-gitops `platform-gitops/agent-platform/policy.yaml` lists it under `knownTools` with `category: capability`, so the catalog's reference check accepts it. Listing it there grants nothing.
- mctl-agents (`orchestrator/options.py`, constant `HUMAN_INPUT_CAPABILITY`) strips it from the SDK `allowed_tools` when building the investigator's options.
- `orchestrator/validate_manifest.py` subtracts it (`_CAPABILITY_TOOLS`) before comparing declared tools with the options builder's real output, so a profile that grants it still validates.

The `issue-investigator-default` profile in mctl-gitops lists it ([mctl-gitops#1277](https://github.com/mctlhq/mctl-gitops/issues/1277)).

### Kill switch

Removing the capability is one reviewed mctl-gitops PR, with no image build, CWFT change or ArgoCD sync. The procedure is in the catalog README, section "Kill switch: `human.request_input`": delete the entry from `spec.tools`, bump `spec.version`, and re-pin the shadow binding's `profile.version`.

## Eligibility

A plan grants the capability when `human.request_input` is literally present in the resolved `ExecutionPlan.tools` (`plan_grants_human_input` in `orchestrator/options.py`). In `legacy` resolver mode there is no plan, so the capability is never granted.

The investigate CWFT sets `ISSUE_INVESTIGATOR_RESOLVER_MODE=declarative`. The investigator calls `plan_grants_human_input` on the resolved plan. Producing a request also requires workflow/run correlation and a human issue author. Legacy mode does not grant the capability.

## Raising a request

The model writes `human-input/draft.json` with exactly `question`, `reason` and `response`. The orchestrator validates the draft (maximum 16 KiB), supplies identity, audience, round and expiry, then seals a `HumanInputRequest` at:

```
platform-gitops/agents-state/<service>/proposals/<slug>/human-input/request.json
```

There is no typed `needs_input` outcome or return value. The presence of a valid `request.json` after a successful investigate step is the only signal the workflow reads. Do not invent an SDK return value for this file-based protocol.

### Building the document

The orchestrator uses `seal_request()` from `orchestrator/human_input.py`; the model must not write a sealed request directly. It is the only constructor that produces a sealed request; it computes `question_hash`, `request_hash` and `request_id` and refuses an inconsistent document.

| Field | Rules |
|-------|-------|
| `api_version` / `kind` | `humaninput.mctl.ai/v1alpha1` / `HumanInputRequest`. Set by `seal_request` |
| `work_item_id` | The WorkItem this execution belongs to |
| `execution` | `ExecutionCorrelation`. `temporal_workflow_id` must be the owning DevLoop workflow id; `temporal_run_id`, when set, must be this run's id |
| `question`, `reason` | Non-empty strings. Shown to the human; never logged |
| `response` | `type` is one of `free_text`, `single_choice`, `multi_choice`, `structured`. The two choice types need a non-empty `options` list. `schema_ref` is optional |
| `requested_from` | `audience` is one of `work_item_owner`, `repo_operators`, `tenant_operators`. `actor_refs` must name at least one actor, in the form `github:<login>` for the response endpoint to match it |
| `context_refs` | Optional locators, each starting with `github:`, `gitops-file:`, `context_snapshot:` or `evidence:` |
| `created_at`, `expires_at` | ISO 8601. `expires_at` must be after `created_at` and at most `MAX_REQUEST_TTL_SECONDS` (604800 s, 7 days) later |
| `round` | Integer ≥ 1. Advisory; the workflow enforces its own round count |
| `request_version` | Integer, default `1` |

`created_at` is not covered by `request_hash`, so sealing identical content twice yields the same `request_id`, and a retried step is idempotent.

### Rules for the producer

- Ask only what a human must decide. Data the agent can read with its own tools is retrieval, not clarification.
- Do not ask for authorization. An answer never satisfies an approval gate (see [Semantics](/human-input/semantics)).
- Do not put payloads in `context_refs`; reference them.
- Do not re-ask an answered question. A request whose `question_hash` was already answered in this execution is ignored, and the run proceeds without waiting.
- Stay within three rounds. After `MAX_CLARIFICATION_ROUNDS` (3) accepted answers, a further request fails the execution with `clarification_rounds_exhausted`.
- A new request overwrites the previous `request.json`. The continuation removes a carried request that was answered and writes `answered.json`.

### Failure modes

| Condition | Result |
|-----------|--------|
| `request.json` does not parse, fails schema, or its hashes do not match its content | Execution fails, error type `human_input_malformed` (non-retryable) |
| File larger than the GitHub contents-API inline limit (1 MB) | Execution fails, `human_input_malformed` |
| Sealed by a different workflow id or run id, or `created_at` more than 10 minutes before this run started | Skipped as a leftover (`human_input.foreign_execution`) |
| Already expired when read | Skipped as a leftover (`human_input.stale_expired`) |
| `round` > 3, or 3 answers already accepted | Execution fails, `clarification_rounds_exhausted` (non-retryable) |
| No accepted answer before the deadline | Loop ends with outcome `timed_out`; no implementation runs |

## What the continuation receives

When an answer is accepted, the workflow resubmits `mctl-agents-investigate` with the original parameters plus `human_input_responses`: a JSON array with one entry per accepted answer in this execution, oldest first.

| Field | Meaning |
|-------|---------|
| `request_id`, `request_hash` | The request this answer resolved |
| `value` | The answer, already validated against the request's `response` type |
| `respondent` | `actor_type:actor_id`, for example `github:alice`. Derived from authentication by mctl-api |
| `surface` | Where the answer was typed. Caller-declared provenance, not trusted |
| `received_at` | When mctl-api received the answer |

Guarantees on `main`:

- Every answer accepted in this execution is included, not just the latest.
- Each `value` passed `validate_response`: correct `request_id` and `request_hash`, before expiry, from a respondent in `actor_refs`, and matching the response type.
- The response array does not contain the question. The investigator recovers questions from proposal artifacts and renders them next to the accepted answers.

Not guaranteed:

- The answer is correct, safe or authorized. Treat `value` as untrusted human input, not as an instruction.
- A fresh ContextSnapshot solely because an answer arrived. Answers are supplied through the explicit continuation parameter.

## Related

- [Architecture](/human-input/architecture)
- [Semantics](/human-input/semantics)
- [Surface adapter guide](/human-input/surface-adapters)

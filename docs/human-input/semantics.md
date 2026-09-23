# Human Input: Semantics

This page states what a human-input answer means, what it cannot mean, and the bounds that keep a clarification loop finite. The normative source is [ADR 013](https://github.com/mctlhq/mctl-agents/blob/main/docs/adr/013-human-input-contract.md); the rules below restate it and the code that enforces it.

In this page, **must** and **must not** are normative for every component that produces, relays or consumes human input.

## Three different things

| | Retrieval | Clarification | Approval |
|---|-----------|---------------|----------|
| Question it answers | "What does the data say?" | "What did the human mean?" | "Is this action authorized?" |
| Who acts | The agent, with its own tools | A human in the request's `requested_from.actor_refs` | An approver, through the approval path |
| Mechanism | Tool calls; `context_refs` point at what was read | `HumanInputRequest` / `HumanInputResponse`, `WAITING_FOR_INPUT` | The workflow's `approve` signal, `WAITING_FOR_APPROVAL` |
| Effect | Evidence for the agent | Data handed to the next investigate run | Unblocks the gated action |

Retrieval does not involve this primitive. An agent must not raise a clarification for something it can read itself. `context_refs` entries are locators only: each must start with `github:`, `gitops-file:`, `context_snapshot:` or `evidence:`, so a request cannot carry a raw payload in place of a reference.

Approval is tracked separately in [mctl-agents#198](https://github.com/mctlhq/mctl-agents/issues/198).

## Clarification is not approval

- A human-input answer **must never** satisfy an approval or policy gate. In `DevLoopWorkflow` the `human_input_response` signal handler never touches the approval flag; only the `approve` signal sets it.
- The two durable waits **must** stay distinguishable by state string. `human_input_state` reports `RUNNING`, `WAITING_FOR_INPUT` or `INPUT_TIMED_OUT`, never `WAITING_FOR_APPROVAL`.
- mctl-api's response endpoint **never** signals `approve`, and nothing it records is read by the approval path. Approval has its own endpoint, `POST /api/v1/agents/dev-loop/{workflow_id}/approve`.
- An answer whose text reads like an approval ("use option B and merge it") resumes the clarification wait and nothing else.

A consequence for surfaces: showing a pending question and showing a pending approval are two different UI states, and one control must not do both.

## Answers are data, not instructions

A `HumanInputResponse` is data with provenance. It grants, authorizes and approves nothing.

- **Provenance is attached by the platform, not the answer.** The respondent is derived from authentication as `github:<login>`; the request body cannot name one. `surface` is caller-declared and recorded as provenance only; it is shape-checked (`^[a-z][a-z0-9_-]{0,31}$`) and not trusted.
- **The answer is bound to exactly one question.** A response carries `request_id` and `request_hash`, and both must match the sealed request. `request_hash` covers every content field except `request_id`, `request_hash` and `created_at`, so an answer cannot be replayed against a changed question.
- **The value is typed.** `validate_response` accepts, per `response.type`:
  - `free_text`: a non-blank string
  - `single_choice`: one of the declared `options`
  - `multi_choice`: a non-empty list of declared `options` (no min/max count, duplicates not rejected)
  - `structured`: a JSON object
- **The agent must treat `value` as untrusted input.** It is text a human typed, delivered to a model. It is context for the agent's own decision, not a command channel into the platform.
- **No transcripts.** Workflow logs and the `human_input_state` query expose ids, hashes, timestamps and counters, never `question`, `reason` or `value`. mctl-api audit entries carry ids only; the ledger keeps the raw value only until delivery resolves or the request expires.

## Controls

Constants from `orchestrator/human_input.py`, `DevLoopWorkflow` and mctl-api on `main`:

| Control | Value | Enforced by |
|---------|-------|-------------|
| Maximum request lifetime | `MAX_REQUEST_TTL_SECONDS = 604800` (7 days) | `validate()`: `expires_at` must parse, be after `created_at`, and be at most 7 days after it. The workflow also clamps the wait to its own now + 7 days (`human_input.expiry_clamped`) |
| Default request lifetime | `DEFAULT_REQUEST_TTL_SECONDS = 86400` (1 day) | Declared only. No code reads it yet ([mctl-agents#451](https://github.com/mctlhq/mctl-agents/issues/451)) |
| Clarification rounds | `MAX_CLARIFICATION_ROUNDS = 3` | The workflow's own resume count. At 3 accepted answers the next request fails the execution with `clarification_rounds_exhausted` (non-retryable). The producer-written `round` is also checked but is advisory |
| Outstanding requests | `MAX_OUTSTANDING_REQUESTS_PER_EXECUTION = 1` | Declared only; one request per execution follows from one `request.json` per proposal (#451) |
| Dedupe | `question_hash` | SHA-256 over the whitespace-collapsed, case-folded question plus the response spec. A request whose `question_hash` was already answered in this execution is ignored, not waited on |
| Answer queue | `HUMAN_INPUT_RESPONSE_QUEUE_LIMIT = 16` | Payloads over the cap, or arriving while not waiting, are counted in `rejected_count` and dropped |
| Leftover detection | `HUMAN_INPUT_PRIOR_RUN_SLACK = 10 min` | A request whose `created_at` predates this run's start by more than 10 minutes is another execution's leftover and is skipped |
| First answer wins | Workflow and ledger | The workflow resumes on the first valid answer. mctl-api's ledger lets the first claim win and refuses a different answer with `answered` |
| Write rate | 20 requests/min per user | The response endpoint is in mctl-api's write rate-limit group |
| Response size | 64 KiB | mctl-api request body limit |

### Timeouts and expiry

- A request that is already expired when the workflow reads it is a leftover from an earlier execution and is skipped (`human_input.stale_expired`). It does not end the new execution.
- A request that expires while the workflow waits ends the loop: the state becomes `INPUT_TIMED_OUT`, the outcome is `timed_out`, and no implementation runs.
- No answer is accepted at or after `expires_at`, whether checked by mctl-api or by the workflow.
- The `abandon` signal ends the wait at once and wins over an answer arriving at the same moment.

### Retirement by read

The workflow never writes to mctl-gitops to retire a request. It skips, on read, any request that is expired, sealed by a different workflow id or run id, or created before the current run started. A durable answered-marker written by the producer is tracked in [mctl-agents#451](https://github.com/mctlhq/mctl-agents/issues/451).

## Related

- [Architecture](/human-input/architecture)
- [Surface adapter guide](/human-input/surface-adapters)
- [Agent author guide](/human-input/agent-authors)

# Human Input: Surface Adapter Guide

A surface is any place a human sees a pending question and types an answer: Telegram, the Portal, a GitHub comment, an MCP client. This guide describes how a surface integrates with the mctl-api read model and response endpoint.

::: warning Status
The endpoints below are merged in mctl-api ([mctl-api#261](https://github.com/mctlhq/mctl-api/issues/261)) and ship with release PR [mctl-api#340](https://github.com/mctlhq/mctl-api/pull/340). Until that release is deployed they are not available on `api.mctl.ai`.

No surface adapter exists yet:

- **Telegram**: [mctl-telegram#571](https://github.com/mctlhq/mctl-telegram/issues/571), blocked.
- **Portal**: [mctl-portal#124](https://github.com/mctlhq/mctl-portal/issues/124), blocked. The Execution Canvas it builds on ([mctl-portal#111](https://github.com/mctlhq/mctl-portal/issues/111)) does not exist yet, and the portal calls mctl-api with a service token only, which cannot answer (see [Identity](#identity)).
- **GitHub comment, MCP client**: no adapter exists, and mctl-api exposes no MCP tool for human input.
:::

## Surfaces consume, never own, state

This rule is normative for every surface:

- A surface **must** read pending requests and their state from mctl-api, and **must not** treat a local copy as the source of truth. The request content is owned by mctl-gitops; whether it is pending is owned by the `DevLoopWorkflow` execution.
- A surface **must** submit answers through `POST /api/v1/human-input/{request_id}/response`. It **must not** signal Temporal, write to mctl-gitops, or call the approval endpoint as a result of an answer.
- A surface **may** cache a request for display, and **must** re-read it before presenting it as answerable.
- A surface **must not** invent a respondent. The respondent is whoever authenticated the submission.

## Identity

mctl-api decides who may see and who may answer from how the caller authenticated. See [Authentication](/security/authentication) for the token types.

| Caller | Sees a request | Can answer |
|--------|----------------|------------|
| GitHub token whose `github:<login>` is in `actor_refs` | Yes | Yes |
| mctl-api OAuth JWT (minted after GitHub login) whose `github:<login>` is in `actor_refs` | Yes | Yes |
| Dex JWT | Only if also an admin | No. A non-admin gets `404` (the request is not visible); an admin gets `403 not_eligible`. This holds even if the Dex username equals a GitHub login in `actor_refs` |
| Platform admin (GitHub-verified) | Yes, including `eligible_actors` and `invalid_documents` | Only if their verified `github:<login>` is in `actor_refs` |
| Service principal (relaying for a surface) | Yes, including `eligible_actors` and `invalid_documents` | No: `403`. A human answer relayed by a machine credential cannot be told apart from the machine answering |
| Anyone else | No: the request is reported as `404` | No |

The consequence for adapter design: a surface may list requests with a service credential, but must submit each answer with the answering human's own GitHub-verified credential. The respondent is recorded as `github:<login>`, taken from authentication. The request body has no respondent field and unknown fields are rejected.

## Endpoints

All three require authentication. The two reads share the general authenticated rate limit; the response endpoint is in the write group (20 requests per minute per user).

### `GET /api/v1/human-input`

Lists the requests the caller may see.

| Query parameter | Values | Default |
|-----------------|--------|---------|
| `state` | `pending`, `all` | `pending` |
| `work_item_id` | a WorkItem id | none |

```json
{
  "items": [
    {
      "request_id": "hir-377a93a48528eb13",
      "request_hash": "sha256:…",
      "request_version": 1,
      "round": 1,
      "work_item_id": "…",
      "service": "mctl-api",
      "proposal": "issue-261-…",
      "workflow_id": "dev-loop-mctlhq-mctl-api-261",
      "agent": "issue-investigator",
      "question": "…",
      "reason": "…",
      "response_type": "single_choice",
      "options": ["option-a", "option-b"],
      "context_refs": ["github:mctlhq/mctl-api#261"],
      "audience": "repo_operators",
      "can_respond": true,
      "created_at": "…",
      "expires_at": "…",
      "state": "pending"
    }
  ],
  "count": 1
}
```

- `eligible_actors` (the full `actor_refs` list) and `invalid_documents` (request files that failed seal verification) are returned only to admins and the service principal.
- Internal correlation data (execution hashes, the target commit, Argo names, `question_hash`) is never returned.
- With `state=pending`, the endpoint answers **503** rather than a short or empty list when pending cannot be determined for any candidate (no Temporal client, a query failed or timed out). Treat 503 as "unknown", never as "nothing is waiting". `state=all` returns each request with `state: unknown` instead.
- A request file that fails verification is never listed.

### `GET /api/v1/human-input/{request_id}`

Returns one request in the same shape, with its state. `request_id` must match `^hir-[0-9a-f]{16}$` (otherwise 400). A request the caller may not see returns **404**, not 403.

### `POST /api/v1/human-input/{request_id}/response`

```json
{
  "request_hash": "sha256:…",
  "value": "option-b",
  "surface": "telegram"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `request_hash` | Yes | Echo the `request_hash` from the read model |
| `value` | Yes | String for `free_text` (non-blank) and `single_choice` (one option), non-empty array of options for `multi_choice`, object for `structured` |
| `surface` | No | Defaults to `api`. Must match `^[a-z][a-z0-9_-]{0,31}$`. Provenance only |

The body is limited to 64 KiB; unknown fields and trailing data are rejected.

Result body (`HumanInputResponseResult`):

```json
{
  "request_id": "hir-377a93a48528eb13",
  "status": "accepted",
  "state": "resolved",
  "respondent": "github:alice",
  "received_at": "2026-09-23T10:15:00Z"
}
```

`status` is one of `accepted`, `pending_delivery`, `rejected`.

## Handling outcomes

| HTTP | `status` / `state` | Meaning | What the surface should do |
|------|--------------------|---------|----------------------------|
| 200 | `accepted` / `resolved` | The workflow resumed on this answer | Mark the question answered |
| 200 | `accepted`, detail `already accepted` | The same answer from the same respondent was already accepted | Treat as success (idempotent retry) |
| 202 | `pending_delivery` / `pending` | Signalled, not confirmed within the 5-second confirmation budget | Resubmit the same answer later to check |
| 400 | `Error` | Malformed `request_id` or body | Fix the request |
| 401 | `Error` | Not authenticated | Authenticate the human |
| 403 | `rejected` / `not_eligible` | Caller is not GitHub-verified, or not in `actor_refs` | Tell the human they cannot answer this request |
| 403 | `Error` | The service principal tried to answer | Submit with the human's credential |
| 404 | `Error` | No such request, or not visible to the caller | Stop showing it |
| 409 | `rejected` / `superseded` | `request_hash` does not match the current request | Re-read the request; the question changed |
| 409 | `rejected` / `expired` | Past `expires_at` | Stop showing it |
| 409 | `rejected` / `timed_out` | The workflow's wait timed out | Stop showing it |
| 409 | `rejected` / `not_pending` | The workflow is not waiting on this request, or no longer exists | Stop showing it |
| 409 | `rejected` / `answered` | A different answer was recorded first | Show that the question was already answered |
| 409 | `rejected` / `pending` | The workflow refused this answer and is still waiting | Let the human correct and resubmit |
| 422 | `rejected` / `invalid_value` | The value does not match `response_type` | Let the human correct and resubmit |
| 500 | `Error` or `rejected` | Request files unreadable, or a recorded answer unreadable and dropped | Retry later; report if persistent |
| 503 | `pending_delivery` / `unknown` | The answer **is recorded** but could not be signalled | Resubmit; the next submission delivers the recorded answer first |
| 503 | `Error` | Nothing was recorded (endpoint not configured, ledger unavailable, workflow could not be asked) | Retry later |

There is no `410 Gone`; expiry is reported as `409` with state `expired`.

## Delivery guarantees

- **Record before signal.** The answer is written to the `human_input_deliveries` ledger as `pending_delivery` before the signal is sent. A Temporal outage leaves it recorded and retryable, not lost.
- **First claim wins.** There is at most one live delivery per `request_id`. A different answer submitted later gets `409 answered`. If the first delivery was rejected, the request is free again.
- **Any later submission redelivers.** When a recorded answer is still `pending_delivery`, the next submission for that request, from anyone, first pushes the recorded answer through. No background worker is involved.
- **At least once.** Two identical submissions racing each other can both signal. The workflow tolerates this: it takes the first valid answer and counts and drops payloads that arrive after it stops waiting.
- **Acceptance is proven, not assumed.** mctl-api records the workflow's `resume_count` before delivering. An answer counts as accepted only when `resume_count` has advanced **and** the workflow still reports this `request_id`.
- **Configuration.** The ledger uses `HUMAN_INPUT_DB_URL`, falling back to `AUDIT_DB_URL`. With neither, the response endpoint answers 503; there is no in-memory fallback.

## Adapter checklist

1. List with `GET /api/v1/human-input?state=pending`; treat 503 as unknown.
2. Render `question`, `reason`, `response_type`, `options` and `expires_at`. Offer answer controls only when `can_respond` is `true` for the human in front of the surface.
3. Map the surface user to a GitHub-verified mctl-api credential. If you cannot, the surface can display requests but cannot collect answers.
4. Submit with the human's credential, echoing `request_hash` and setting `surface`.
5. On 202 or `503 pending_delivery`, resubmit the same answer; do not change it.
6. On `superseded`, re-read and re-render. On `expired`, `timed_out`, `not_pending`, `answered` or 404, stop presenting the request.
7. Keep clarification and approval visually and functionally separate. Never trigger an approval from an answer.

## Related

- [Architecture](/human-input/architecture)
- [Semantics](/human-input/semantics)
- [REST API](/api/)
- OpenAPI: [api.mctl.ai/openapi.yaml](https://api.mctl.ai/openapi.yaml) (includes these endpoints once mctl-api#340 is released)

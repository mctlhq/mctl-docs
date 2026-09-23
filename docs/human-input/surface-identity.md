# Human Input: Surface Identity and Relay

A surface such as the Telegram bot or the portal backend authenticates to mctl-api as a machine. An answer to a human-input request, like a work-item change, must be attributed to the **human** behind the surface. Surface identity links do this without handing any surface a general "act as anyone" credential.

::: warning Status
Merged in mctl-api ([mctl-api#350](https://github.com/mctlhq/mctl-api/issues/350): [#358](https://github.com/mctlhq/mctl-api/pull/358), [#359](https://github.com/mctlhq/mctl-api/pull/359)), not yet released or deployed. Nothing is available on `api.mctl.ai` until the next mctl-api release is deployed with the surface tokens configured. No surface uses it yet: the Telegram and portal adapters adopt it in their own repositories.
:::

## Principals

Each surface has its **own** service principal, authenticated by its own bearer token:

| Principal | Token (mctl-api env) |
|-----------|----------------------|
| `surface:telegram` | `MCTL_SURFACE_TELEGRAM_TOKEN` |
| `surface:portal` | `MCTL_SURFACE_PORTAL_TOKEN` |

A surface principal is not an admin, belongs to no tenant, and is distinct from `mctl-agent`. It can call only an allowlist of routes, and any other route answers `403 surface_route_not_allowed`. `mctl-agent` has **no** relay or on-behalf-of authority.

## Linking: a possession proof

Neither side can create a link alone.

1. The human, authenticated with their own GitHub-verified credential, calls `POST /api/v1/surface-identities/challenges` with `{"surface":"telegram"}`. mctl-api returns a one-time code, e.g. `ABCD-EFGH-…`. The code is valid for 10 minutes, single use, and bound to that human and that surface. Only its hash is stored.
2. The human gives the code to the surface, for example by sending it to the Telegram bot.
3. The surface principal redeems it: `POST /api/v1/surface-identities/redeem` with body `{"code":"…"}` and header `X-MCTL-Surface-Actor: <the surface-native id it observed>` (the Telegram user id; the portal session subject).
4. mctl-api records the link `telegram:<id> ↔ github:<login>`.

How redemption fails:

- Every refused redemption answers the same `403 challenge_invalid`, whether the code is unknown, used, expired, or belongs to another surface. A code exposed to the wrong surface is burnt.
- An identity already linked to another human answers `409 link_conflict`. The old link must be revoked first.
- Redeeming again for the same pair is idempotent and renews an expiring link.

The human lists their links with `GET /api/v1/surface-identities` and revokes one with `POST /api/v1/surface-identities/{id}/revoke`. A GitHub-verified admin may list and revoke anyone's links. A surface or `mctl-agent` may do neither. `SURFACE_LINK_TTL` optionally expires links.

## Relay

On a relay route, the surface principal sends `X-MCTL-Surface-Actor: <surface-native id>`. mctl-api resolves the verified link for **its own** surface and that id, then handles the request **as the linked human**, with the human's tenant access and never admin.

| Situation | Result |
|-----------|--------|
| No header | `403 relay_required` |
| Unknown or forged id, or a link that belongs to another surface | `403 link_not_found` |
| Revoked link | `403 link_revoked` |
| Expired link | `403 link_expired` |
| Malformed id for the surface | `400` |
| The header sent by anyone but a surface principal | `400 actor_not_accepted` |
| A login or actor field in the body | `400` (identity comes only from the link) |

Every `403` is audited as `surface_identity.relay_refused`. A relayed request is audited with **both** identities: the human as actor or respondent, and `acting_principal: surface:<name>`. Work-item events carry the same column.

Relay routes, opted in one by one:

- `GET /api/v1/human-input`
- `GET /api/v1/human-input/{request_id}`
- `POST /api/v1/human-input/{request_id}/response`
- `POST /api/v1/work-items`
- `GET /api/v1/work-items/{id}`
- `POST /api/v1/work-items/{id}/intents`
- `POST /api/v1/work-items/{id}/resume`
- `POST /api/v1/work-items/{id}/surface-refs`

A relayed request's `surface` (or `origin_surface`) is the relaying surface. Claiming another answers `400`, and omitting it defaults to the relaying surface.

For human input specifically, a relayed answer is accepted as `github:<login>` of the linked human, if that login is in `actor_refs`. The bare surface or service principal still cannot answer.

## Rate limits

- Each surface principal has an aggregate ceiling of 1200 requests per minute.
- Redeem calls count per end user: `surface:<name>|<id>`.
- Relayed calls count against the linked human's own budget, which is shared with their CLI and portal use.

## Related

- [Surface Adapter Guide](/human-input/surface-adapters)
- [Architecture](/human-input/architecture)
- mctl-api: `docs/work-context-contract.md`, section "Surface relay"

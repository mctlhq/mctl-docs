# Authentication

MCTL supports three authentication methods, all validated by `mctl-api`.

## GitHub Token

Direct GitHub personal access token authentication. The API validates the token against the GitHub API and checks organization membership.

**Used by**: MCP clients, API scripts

```
Authorization: Bearer ghp_xxxxxxxxxxxx
```

The token must have `read:org` scope to verify organization membership.

## Dex SSO (JWT)

OpenID Connect via Dex, the platform's SSO provider at `ops.mctl.ai`.

**Used by**: Developer portal, internal services

The API validates the JWT signature using JWKS keys from `ops.mctl.ai/api/dex/keys`. Groups are extracted from token claims.

## OAuth JWT

OAuth 2.0 PKCE flow for browser-based clients. Tokens are issued by `mctl-api` itself and signed with HMAC-SHA256.

**Used by**: Claude.ai native connector, mctl.ai web flows

The flow:
1. Client initiates OAuth PKCE flow via `mctl.ai/api/github/login`
2. User authenticates with GitHub
3. MCTL issues a JWT with the user's identity and groups
4. The token is returned via URL fragment (never hits server logs)

## Auth Bypass (Development)

For local development, set `AUTH_REQUIRED=false` to bypass authentication. This should never be used in production.

## Token Scopes

All authentication methods resolve to the same internal identity with:
- **User ID** — GitHub username
- **Organization** — GitHub organization membership
- **Groups** — tenant access groups (from GitOps config or token claims)

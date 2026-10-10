# Authentication

Every request to `mctl-api` carries a bearer token, and the API verifies it on every call.

## MCP Sign-in (OAuth)

The standard way to connect. `mctl-api` implements MCP authorization: OAuth 2.1 with PKCE and dynamic client registration.

**Used by**: Claude.ai, Claude Code, Claude Desktop, Cursor, VS Code, Gemini CLI, the `mctl` CLI

The flow:
1. The client calls `https://api.mctl.ai/mcp` without a token and receives `401` with a pointer to `/.well-known/oauth-protected-resource`
2. The client registers itself (`/oauth/register`) and opens `/oauth/authorize` in your browser
3. You sign in on the MCTL sign-in page (`auth.mctl.ai`)
4. The client exchanges the code at `/oauth/token` for an access token issued and signed by `mctl-api`, and refreshes it on its own

No credential is ever copied into a config file.

## GitHub Token (legacy)

`mctl-api` still accepts a GitHub token as a bearer while its remaining callers are moved to MCP sign-in. Do not use it for an MCP client or anything else that can open a browser.

Its one documented use is a non-interactive caller: the CI deploy job in [Scaffolding](/guides/scaffolding) authenticates with a classic PAT (`read:user`) stored as `MCTL_GITHUB_TOKEN`. That path stays until a non-interactive MCTL credential replaces it.

```
Authorization: Bearer <github-token>
```

## Auth Bypass (Development)

For local development, set `AUTH_REQUIRED=false` to bypass authentication. This should never be used in production.

## Token Scopes

All authentication methods resolve to the same internal identity with:
- **User ID** — GitHub username
- **Organization** — GitHub organization membership
- **Groups** — tenant access groups (from GitOps config or token claims)

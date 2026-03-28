# REST API

The MCTL REST API is served by `mctl-api` at `api.mctl.ai`.

## Base URL

```
https://api.mctl.ai/api
```

## Authentication

Include an `Authorization` header with every request:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.mctl.ai/api/tenants
```

See [Authentication](/security/authentication) for supported token types.

## Response Format

All responses are JSON. Successful responses return the data directly. Errors return:

```json
{
  "error": "description of the error"
}
```

## Endpoints

<!-- TODO: Document REST API endpoints with request/response examples -->

The REST API mirrors the MCP tools. For a complete list of available operations, see the [MCP Tools Reference](/mcp/tools-reference).

## Rate Limiting

<!-- TODO: Document rate limits -->

API rate limits will be documented here as they are configured.

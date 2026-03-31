# OpenClaw Integration

MCTL includes OpenClaw as a managed platform service — a personal AI assistant that connects to messaging channels (Telegram, Discord, Slack, WhatsApp, and others) and can interact with your infrastructure through MCTL.

## What is OpenClaw?

[OpenClaw](https://openclaw.ai) is an open-source personal AI assistant that runs on your own infrastructure. It answers on channels you already use (Telegram, Discord, Slack, WhatsApp, and 20+ others), supports voice, and provides a web-based Canvas UI.

MCTL maintains a fork (`mctl-openclaw`) that integrates OpenClaw with the platform:

- **MCTL OAuth**: seamless sign-in through the platform's authentication system
- **Incident webhooks**: the mctl-agent can dispatch incidents to OpenClaw for collaborative remediation
- **Platform-aware sessions**: OpenClaw sessions are scoped to GitHub-authenticated users
- **Managed deployment**: provisioned and scaled through MCTL MCP tools and GitOps

## Architecture

```
Messaging Channels (Telegram, Discord, Slack, ...)
        |
        v
   OpenClaw Gateway  <--- mctl-agent (incident webhooks)
        |
        v
   AI Model (OpenAI, Anthropic, etc.)
        |
        v
   Skills & Tools (including MCTL MCP tools)
```

OpenClaw runs as a gateway service in your tenant namespace. It connects to your messaging channels and routes conversations through an AI model. The platform handles deployment, scaling, database provisioning, and secret management.

## Deploying OpenClaw

### Via MCP

```
"Deploy OpenClaw for my-team"
```

This calls `mctl_deploy_openclaw`, which:

1. Prepares the deployment configuration
2. Returns a Telegram bot-token intake URL
3. After you provide the bot token, call:
   ```
   "Resume the OpenClaw deployment for my-team"
   ```
4. MCTL provisions a PostgreSQL database and deploys the gateway

### What gets provisioned

| Resource | Description |
|----------|-------------|
| Deployment | OpenClaw gateway container |
| Database | PostgreSQL on shared CNPG cluster |
| Secrets | Bot tokens, API keys stored in Vault |
| Ingress | HTTPS endpoint for the web UI and webhook callbacks |

## Resource Optimization

OpenClaw can consume significant resources depending on usage patterns. MCTL provides tools to right-size your deployment:

### Get sizing recommendations

```
"Get resource sizing recommendations for openclaw in my-team"
```

This calls `mctl_get_openclaw_sizing_recommendation`, which analyzes VictoriaMetrics history and suggests an optimal resource profile.

### Apply a resource profile

```
"Apply the steady-small resource profile to openclaw in my-team"
```

Available profiles:

| Profile | CPU Request | Memory Request | Use case |
|---------|-------------|----------------|----------|
| `startup` | 500m | 512Mi | Initial deployment, testing |
| `steady-medium` | 250m | 384Mi | Regular usage, multiple channels |
| `steady-small` | 100m | 256Mi | Low traffic, single channel |

## Incident Integration

The mctl-agent can dispatch incidents to OpenClaw for collaborative remediation:

1. AlertManager fires an alert
2. mctl-agent creates an incident ticket and selects a skill
3. If the skill requires external assistance, the agent sends a signed webhook to OpenClaw
4. OpenClaw creates a scoped session for the incident
5. The AI model analyzes the incident and proposes a fix
6. Results are sent back to mctl-agent via callback
7. mctl-agent creates a PR to `mctl-gitops` with the fix

This integration enables multi-agent remediation where the platform agent and the personal assistant collaborate on incident resolution.

## Fork Maintenance

`mctl-openclaw` tracks upstream `openclaw/openclaw` with a weekly sync workflow:

- A GitHub Actions workflow creates a `sync/upstream-YYYY-MM-DD` branch
- The sync PR is tested in the `labs-openclaw` tenant before promotion
- Fork-specific patches are maintained as a thin layer on top of upstream

Fork-specific areas reviewed on each sync:
- OAuth and gateway behavior
- Webhook automation and session creation
- Whisper/runtime packaging
- Platform-specific deployment assumptions

## Useful Links

- [OpenClaw documentation](https://docs.openclaw.ai)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [MCTL MCP Tools Reference](/mcp/tools-reference) — see the OpenClaw section

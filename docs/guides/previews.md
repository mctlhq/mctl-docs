# Preview Environments

Deploy temporary, isolated copies of a service — for a pull request, feature branch, or any arbitrary image tag.
Previews run in the same namespace as the production service and share its secrets. They are automatically
cleaned up after a configurable TTL (default: 24 hours).

## Two modes

### 1. Deploy from an existing image tag

Use this when the image is already built (e.g. your CI pushed it to GHCR):

```
"Create a preview of payments-api at tag 1.4.2 in the checkout team"
```

```
mctl_create_preview
  team_name:      checkout
  component_name: payments-api
  image_tag:      1.4.2
```

The preview is live within ~2 minutes (Helm install + pod start).

### 2. Build from a branch, then deploy

Use this when the image does not exist yet. Provide `git_ref` and `dockerfile_repo` — the platform
builds the image via `build-image.yaml` in mctl-gitops, waits for it to complete, then deploys:

```
"Create a preview of payments-api from branch feat/new-checkout in myorg/payments-api"
```

```
mctl_create_preview
  team_name:       checkout
  component_name:  payments-api
  git_ref:         feat/new-checkout
  dockerfile_repo: myorg/payments-api
```

`image_tag` is auto-generated as `preview-{branch}-{timestamp}` — you do not need to specify it.
`dockerfile_path` defaults to `Dockerfile`; override if your Dockerfile is elsewhere.

Total time: ~5–10 minutes (build) + ~2 minutes (deploy).

## Preview URL

```
https://{component}-{preview_id}.{platform_domain}
```

The `preview_id` is a 6-character suffix derived from the workflow name. It is returned by
`mctl_create_preview` and used by `mctl_delete_preview`.

## Tracking progress

```
"What is the status of workflow preview-deploy-abc123?"
```

```
mctl_get_workflow_status
  workflow_name: preview-deploy-abc123
```

For build-from-branch previews the workflow runs in two sequential stages:
1. `build-image` — triggers and polls GitHub Actions until the image is pushed
2. `deploy-preview` — Helm install into the team namespace

## Listing previews

```
"Show all active previews for the checkout team"
```

```
mctl_list_previews
  team_name: checkout
```

Returns each preview's URL, image tag, age, and pod health.

## Deleting a preview

Previews are auto-deleted when the TTL expires. To delete immediately:

```
"Delete preview abc123 of payments-api in checkout"
```

```
mctl_delete_preview
  team_name:      checkout
  component_name: payments-api
  preview_id:     abc123
```

## Parameters reference

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `team_name` | yes | — | Team namespace |
| `component_name` | yes | — | Service name |
| `image_tag` | if no `git_ref` | — | Existing image tag to deploy |
| `git_ref` | no | `""` | Branch/SHA/tag to build from |
| `dockerfile_repo` | if `git_ref` set | — | Source repo (`org/repo`) |
| `dockerfile_path` | no | `Dockerfile` | Path to Dockerfile |
| `ttl_hours` | no | `24` | Preview lifetime in hours |

## What the preview inherits

Previews reuse the production service's `values.yaml` as a base so they automatically inherit:

- `imagePullSecrets` — can pull from private GHCR
- `service.port` — same port mapping
- `envFrom` — same ConfigMap/Secret references
- `resources` — same CPU/memory limits

Only `image.tag` and the ingress host are overridden. A new ExternalSecret is **not** created —
the preview pod uses the existing secret already provisioned in the namespace.

## GitHub PR previews (mctl-web pattern)

For repositories with `preview-create.yml` in `.github/workflows/`, previews are created
automatically on every PR open/push — no manual `mctl_create_preview` call needed. The workflow
builds the image and commits a `values.yaml` to mctl-gitops directly.

Use `mctl_create_preview` with `git_ref` for services that do **not** have their own CI pipeline
(the common case for tenant services onboarded via the platform).

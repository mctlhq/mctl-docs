# Scaffolding a service for mctl deploy

When `mctl_deploy_service action=onboard` runs against your repo, mctl
expects three artifacts to already be in place:

1. **`Dockerfile`** at the repo root (or at the configured `dockerfile_path`)
2. (For auto-deploy on push to main) **`.github/workflows/ci.yml`** containing a `deploy` job
3. The component registered to this repository: onboarding records it as the
   `github.com/source-repo` annotation, and the deploy job authenticates with
   the job's own GitHub Actions OIDC token. No secret to create.

If your repo is missing the first two, copy the canonical templates below.
Adapt the entrypoint, dependency installation and probes to your application. Image size and runtime privileges depend on the selected base image and application.

## Platform health checks

The default chart checks `/healthz` for liveness and `/readyz` for readiness.
Implement both without authentication, or pass `health_check_path="/healthz"`
at onboarding if your app exposes only `/healthz`. A Dockerfile `HEALTHCHECK`
does not configure Kubernetes probes.

## Container requirements

Every service runs with a restricted security context. Build the image so
it works under these rules:

| Requirement | Why |
| --- | --- |
| Run as a **numeric** non-root user: `USER 10001:10001`, not `USER app` | Kubernetes can only check that a container is not root when the user is a number. With a user name it cannot verify, so once non-root is enforced the pod never starts (`CreateContainerConfigError`). |
| Listen on a port above 1024 (`8080`, `8000`, `8787`) | A non-root process cannot bind ports below 1024. |
| Write only to `/tmp` at runtime | The root filesystem becomes read-only. `/tmp` is a writable empty directory that is wiped on every restart, so keep durable data in a [database](/guides/databases) or object storage. |
| Need no extra privileges | All Linux capabilities are dropped and privilege escalation is blocked, so `sudo`, `su`, `gosu` and setuid binaries do not work. Do anything that needs root at build time, in `RUN` steps. |

Today every service already runs without capabilities, without privilege
escalation and under the `RuntimeDefault` seccomp profile. Non-root and a
read-only root filesystem are being rolled out: platform services already
run that way, and it will become the default for every service. An image
that follows the table works both now and after the switch. All templates
below follow it.

If a library writes a cache under `$HOME` at runtime, point it at `/tmp`,
for example with `ENV XDG_CACHE_HOME=/tmp/.cache`.

Check an image locally before onboarding. The first command must print a
number other than `0`, and the container must start and answer its health
check under the second:

```bash
docker image inspect -f '{{.Config.User}}' my-image
docker run --rm -p 8080:8080 --read-only --tmpfs /tmp \
  --cap-drop ALL --security-opt no-new-privileges my-image
```

## Pick a template by language

| Repo contains | Template |
| --- | --- |
| `package.json`, `server.js` / `index.js` | [Node.js](#node-js) |
| `pyproject.toml` or `requirements.txt` | [Python](#python) |
| `go.mod` | [Go](#go) |
| Static SPA (Vue / React / SvelteKit `dist/`) | [Static](#static) |

## Node.js

```dockerfile
FROM node:22.11-alpine3.20

RUN apk add --no-cache tini

ENV NODE_ENV=production \
    PORT=8787

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN addgroup -S -g 10001 app && adduser -S -u 10001 -G app app

USER 10001:10001

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8787/healthz', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
```

Implement a `GET /healthz` endpoint returning `200 {"ok": true}` so the
HEALTHCHECK passes. Also implement `/readyz`, or set the shared probe path as
described above. Can't use `/healthz`? Pass `health_check_path=/your-path`
when onboarding to override both liveness and readiness probe paths — but
note that only changes the Kubernetes probes, not this Dockerfile's own
`HEALTHCHECK` line. Update the `HEALTHCHECK` (and any later verification
`curl`) to the same custom path too, or the image will report unhealthy in
any environment that runs Docker's own check (e.g. local `docker run`) even
though the platform reports it healthy. If your service uses a different
entrypoint (`index.js`, `dist/main.js`), update the final `CMD`.

## Python

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /build
COPY requirements.txt ./
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends tini && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /root/.local /home/app/.local
COPY . .

RUN useradd -u 10001 -U -M -d /home/app app

USER 10001:10001
ENV PATH=/home/app/.local/bin:$PATH \
    PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=4)"

ENTRYPOINT ["tini", "--"]
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

This example requires `requirements.txt` containing your runtime dependencies, including `uvicorn`. For a pyproject-only project, adapt the dependency installation step.

Replace `app:app` with your ASGI module path (e.g.,
`my_service.main:app`). For non-uvicorn workloads, swap the `CMD` for
your runner.

## Go

```dockerfile
FROM golang:1.25-alpine AS builder
WORKDIR /build
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags='-s -w' -o /app/server ./cmd/server

FROM alpine:3.20
RUN apk add --no-cache tini ca-certificates
COPY --from=builder /app/server /app/server
RUN addgroup -S -g 10001 app && adduser -S -u 10001 -G app app
USER 10001:10001
ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/app/server"]
```

Adjust `./cmd/server` to your binary's package path.

## Static (Vue / React build → nginx) {#static}

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ || exit 1
```

`nginxinc/nginx-unprivileged` runs as user `101` and keeps its pid file and
temporary files in `/tmp`, so it meets the
[container requirements](#container-requirements). The official `nginx`
image starts as root and does not.

Minimal `nginx.conf` next to your Dockerfile:

```nginx
server {
  listen 8080;
  root /usr/share/nginx/html;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

The SPA fallback (`try_files … /index.html`) lets client-side routing
work without 404s.

## When does the deploy fire?

mctl doesn't watch your repo on its own — your CI workflow is what calls
`mctl_deploy_service` when you want a deploy. Pick the trigger that
matches your release model.

| Pattern | Trigger | When it fits |
| --- | --- | --- |
| **Continuous deployment** | `on: push` to `main` (recommended for one-environment services) | Single env, tags auto-bumped, fast feedback. Every merge ships. |
| **Tag-based** | `on: push` of tags matching `*.*.*` (and skip the auto-bump step) | You want to decide what's a release. Push a tag manually with `git tag X.Y.Z && git push --tags`. |
| **Manual** | `on: workflow_dispatch` | Full human control. No automation. Useful for fragile / regulated services. |
| **Hybrid** | Push to `main` runs validation only; tag push does the deploy | Multi-environment (e.g. staging vs prod) or when validation should diverge from release cadence. |

The snippet below implements the **continuous deployment** pattern:
every push to `main` is auto-tagged with the next SemVer patch and
triggers `mctl_deploy_service`. To switch to **tag-based**, change the
`if:` to `startsWith(github.ref, 'refs/tags/')`, drop the *Compute next
SemVer patch* and *Push new tag* steps, and pass <code v-pre>${{ github.ref_name }}</code>
as `git_tag` in the request body.

Whatever the trigger, the deploy runs only on `push` (to `main` or a tag),
`workflow_dispatch` or `release`. mctl refuses the OIDC token of a
`pull_request` run, and of any other event, so a PR can never deploy.

## Pre-merge docker build (recommended)

Run a `docker build` job on **PRs only** as a pre-merge gate against
broken Dockerfiles. On push to `main`, mctl rebuilds the same image
centrally — duplicating that locally just burns CI minutes. Pattern:

```yaml
docker:
  name: docker image build (pre-merge gate)
  if: github.event_name == 'pull_request'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: docker/setup-buildx-action@v3
    - uses: docker/build-push-action@v6
      with:
        context: .
        push: false
        load: false
        tags: <service>:ci
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

**Important:** because this job is skipped on push, it cannot appear in
the `deploy` job's `needs:` list — a skipped dependency would skip
`deploy` too. Only list jobs that actually run on the deploy trigger
(typically `lint`, `type-check`, `test`).

## CI auto-deploy job

Drop this `deploy` job into `.github/workflows/ci.yml`, after your
existing build / lint / test jobs. The `needs:` list should reference
jobs that actually run on push to `main` — not the PR-only docker
build above. Replace `<team>`, `<service>` and the `needs:` job name.

The job authenticates with its own GitHub Actions OIDC token, minted for
the audience `https://api.mctl.ai`. The token lives for minutes and names
the repository, event and ref the job ran for. You do not create or store
any secret.

```yaml
deploy:
  name: deploy to mctl <team>/<service>
  needs: [<your-build-job>]
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  permissions:
    contents: write   # push the release tag
    id-token: write   # mint the OIDC token for api.mctl.ai
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Compute next SemVer patch
      id: tag
      run: |
        set -euo pipefail
        LAST=$(git describe --tags --abbrev=0 2>/dev/null || echo "0.0.0")
        MAJOR_MINOR=$(echo "$LAST" | cut -d. -f1,2)
        PATCH=$(echo "$LAST" | cut -d. -f3)
        echo "tag=${MAJOR_MINOR}.$((PATCH + 1))" >> "$GITHUB_OUTPUT"

    - name: Push new tag
      run: |
        git config user.name "github-actions[bot]"
        git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
        git tag -a "${{ steps.tag.outputs.tag }}" \
          -m "Auto-deploy ${{ steps.tag.outputs.tag }} from ${{ github.sha }}"
        git push origin "${{ steps.tag.outputs.tag }}"

    - name: Trigger mctl deploy-service
      env:
        GIT_TAG: ${{ steps.tag.outputs.tag }}
      run: |
        set -euo pipefail
        TOKEN=$(curl -fsS -H "Authorization: Bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
          "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=https://api.mctl.ai" | jq -r .value)
        echo "::add-mask::$TOKEN"
        jq -n \
          --arg team "<team>" \
          --arg component "<service>" \
          --arg repo "$GITHUB_REPOSITORY" \
          --arg tag "$GIT_TAG" \
          '{action: "deploy", team_name: $team, component_name: $component,
            dockerfile_repo: $repo, git_tag: $tag}' |
        curl -fsS -X POST https://api.mctl.ai/api/v1/operations/deploy-service/execute \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          --data-binary @-
```

What the CI token may do, and nothing else:

- **Deploy only.** The one route it may call is
  `POST /api/v1/operations/deploy-service/execute` with `action: deploy`.
  `onboard`, `update-config`, every other operation, every read and `/mcp`
  answer 403.
- **A flat body with these fields only:** `action`, `team_name`,
  `component_name`, `dockerfile_repo`, `git_tag` and `dockerfile_path`.
  Anything else (env vars, secrets, host, port, scaling, database,
  `image_tag`) is refused with 403 — change configuration through
  `mctl_deploy_service action=update-config` as a tenant member instead. A
  nested `"parameters"` object is rejected with 400.
- **`git_tag` is required** and must match `^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$`.
- **Its own repository only.** `dockerfile_repo` must be the job's
  repository (`$GITHUB_REPOSITORY`), and the component's
  `github.com/source-repo` annotation, written at onboarding, must name the
  same repository. A component onboarded from another repository cannot be
  deployed from this one.
- **Trusted events and refs only:** `push`, `workflow_dispatch` or `release`,
  from `main` or a tag. `pull_request` runs are always refused.
- **Enabled repository owners.** The repository's owner (organisation or
  user) must be on mctl's allow-list. If the deploy answers 401 with a valid
  workflow, ask a platform admin to add your owner.

::: warning Dockerfile not at the repository root
Send `dockerfile_path` in the body (add `--arg path "deploy/api.Dockerfile"`
and `dockerfile_path: $path`). Omitting it does **not** keep the value you
onboarded with: the deploy defaults it to `Dockerfile`, so a component
onboarded with `deploy/api.Dockerfile` would build the wrong file. The path
must be relative to the repository root, without `..` segments.
:::

::: info Migrating from `MCTL_GITHUB_TOKEN`
Earlier versions of this guide authenticated the deploy job with a classic
GitHub PAT stored as `MCTL_GITHUB_TOKEN`. That method is deprecated and will
stop working when mctl stops accepting GitHub tokens. Replace the job with
the one above, then delete the `MCTL_GITHUB_TOKEN` repository secret and
revoke the PAT on GitHub.
:::

## First-time onboard checklist

1. **Add files** — copy the right Dockerfile and the `deploy` job above.
2. **Grant access** if mctl can't see the repo:
   ```
   mctl_grant_repo_access(team="<team>", repo="<owner>/<repo>")
   ```
   Open the URL it returns, install the GitHub App, then run
   `mctl_sync_repos(team="<team>")`.
3. **Onboard**:
   ```
   mctl_deploy_service(
     action="onboard",
     team_name="<team>",
     component_name="<service>",
     dockerfile_repo="<owner>/<repo>",
     git_tag="0.1.0",
     port="<container port>",
     service_template="default"
   )
   ```
   Onboarding records `dockerfile_repo` as the component's
   `github.com/source-repo` annotation; that is what lets this repository's
   CI deploy it. Pass `dockerfile_path` here too if the Dockerfile is not at
   the root.
4. **Verify** — once mctl reports the workflow Succeeded:
   ```
   curl https://<team>-<service>.mctl.ai/healthz
   ```
   If you passed `health_check_path` to override the platform probe path,
   curl that path instead — and update the Dockerfile's `HEALTHCHECK` line
   to match too. `health_check_path` only changes the Kubernetes liveness/
   readiness probes; it can't rewrite the image's own `HEALTHCHECK`, so an
   app exposing only the custom path will still fail Docker's own health
   check even though the platform reports it healthy.
   
   **Important note on Authentication:** Kubernetes liveness and readiness probes do not send authorization headers. If your service uses authentication middleware or hooks, you **must explicitly bypass auth for your health check endpoints** (e.g. `/healthz`, `/readyz`). Failure to do so will result in 401 Unauthorized responses for K8s probes, causing Kubernetes to endlessly restart and kill your pod (SIGTERM) during deployment.
5. **Push the next commit** — CI auto-bumps to `0.1.1` and deploys
   without human intervention from then on.

# Scaffolding a service for mctl deploy

When `mctl_deploy_service action=onboard` runs against your repo, mctl
expects three artifacts to already be in place:

1. **`Dockerfile`** at the repo root (or at the configured `dockerfile_path`)
2. (For auto-deploy on push to main) **`.github/workflows/ci.yml`** containing a `deploy` job
3. A **`MCTL_GITHUB_TOKEN`** GitHub Actions secret — a classic GitHub PAT with scope `read:user`, used by the deploy job to authenticate to `api.mctl.ai`

If your repo is missing any of these, copy the canonical templates below.
They cover the common languages and produce small (~50–150 MB), non-root
images with sane health-check semantics.

## Pick a template by language

| Repo contains | Template |
| --- | --- |
| `package.json`, `server.js` / `index.js` | [Node.js](#nodejs) |
| `pyproject.toml` or `requirements.txt` | [Python](#python) |
| `go.mod` | [Go](#go) |
| Static SPA (Vue / React / SvelteKit `dist/`) | [Static](#static-vue-react-build-nginx) |

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

RUN addgroup -S app && adduser -S -G app app && chown -R app:app /app

USER app

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8787/healthz', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
```

Implement a `GET /healthz` endpoint returning `200 {"ok": true}` so the
HEALTHCHECK passes. If your service uses a different entrypoint
(`index.js`, `dist/main.js`), update the final `CMD`.

## Python

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /build
COPY pyproject.toml requirements*.txt ./
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends tini && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /root/.local /home/app/.local
COPY . .

RUN useradd -m app && chown -R app:app /app

USER app
ENV PATH=/home/app/.local/bin:$PATH \
    PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8000/healthz || exit 1

ENTRYPOINT ["tini", "--"]
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

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
RUN addgroup -S app && adduser -S -G app app
USER app
ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/app/server"]
```

Adjust `./cmd/server` to your binary's package path.

## Static (Vue / React build → nginx)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
RUN apk add --no-cache tini
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["nginx", "-g", "daemon off;"]
```

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
SemVer patch* and *Push new tag* steps, and pass `${{ github.ref_name }}`
as `git_tag` in the curl payload.

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
build above. Replace `<team>`, `<service>`, `<owner>/<repo>`, and the
`needs:` job name.

```yaml
deploy:
  name: deploy to mctl <team>/<service>
  needs: [<your-build-job>]
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  permissions:
    contents: write
  steps:
    - name: Skip if MCTL_GITHUB_TOKEN unset
      id: gate
      run: |
        if [ -z "${{ secrets.MCTL_GITHUB_TOKEN }}" ]; then
          echo "::warning::MCTL_GITHUB_TOKEN secret not set — skipping deploy"
          echo "skip=true" >> "$GITHUB_OUTPUT"
        else
          echo "skip=false" >> "$GITHUB_OUTPUT"
        fi

    - uses: actions/checkout@v4
      if: steps.gate.outputs.skip != 'true'
      with:
        fetch-depth: 0

    - name: Compute next SemVer patch
      id: tag
      if: steps.gate.outputs.skip != 'true'
      run: |
        set -euo pipefail
        LAST=$(git describe --tags --abbrev=0 2>/dev/null || echo "0.0.0")
        MAJOR_MINOR=$(echo "$LAST" | cut -d. -f1,2)
        PATCH=$(echo "$LAST" | cut -d. -f3)
        echo "tag=${MAJOR_MINOR}.$((PATCH + 1))" >> "$GITHUB_OUTPUT"

    - name: Push new tag
      if: steps.gate.outputs.skip != 'true'
      run: |
        git config user.name "github-actions[bot]"
        git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
        git tag -a "${{ steps.tag.outputs.tag }}" \
          -m "Auto-deploy ${{ steps.tag.outputs.tag }} from ${{ github.sha }}"
        git push origin "${{ steps.tag.outputs.tag }}"

    - name: Trigger mctl deploy-service
      if: steps.gate.outputs.skip != 'true'
      run: |
        set -euo pipefail
        curl -fsS -X POST https://api.mctl.ai/api/v1/operations/deploy-service/execute \
          -H "Authorization: Bearer ${{ secrets.MCTL_GITHUB_TOKEN }}" \
          -H "Content-Type: application/json" \
          -d '{
            "action": "deploy",
            "team_name": "<team>",
            "component_name": "<service>",
            "dockerfile_repo": "<owner>/<repo>",
            "git_tag": "${{ steps.tag.outputs.tag }}"
          }'
```

The gate step makes the job a no-op (with a warning) if the secret
isn't configured yet, so onboarding doesn't fail CI before the secret
exists.

## First-time onboard checklist

1. **Add files** — copy the right Dockerfile and the `deploy` job above.
2. **Create PAT** — `https://github.com/settings/tokens/new` (classic), scope **`read:user`**. Save as repo secret named **`MCTL_GITHUB_TOKEN`**.
3. **Grant access** if mctl can't see the repo:
   ```
   mctl_grant_repo_access(team_name="<team>", repo="<owner>/<repo>")
   ```
   Open the URL it returns, install the GitHub App, then run
   `mctl_sync_repos(team="<team>")`.
4. **Onboard**:
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
5. **Verify** — once mctl reports the workflow Succeeded:
   ```
   curl https://<team>-<service>.mctl.ai/healthz
   ```
6. **Push the next commit** — CI auto-bumps to `0.1.1` and deploys
   without human intervention from then on.

## Reference implementation

`mashkoffdmitry/pelican-libertex-social` runs exactly this pattern
end-to-end: Node.js Dockerfile, the `deploy` job in
`.github/workflows/ci.yml`, `MCTL_GITHUB_TOKEN` secret, deployed as
`labs/pelican-proxy` at `https://labs-pelican-proxy.mctl.ai`. Browse
the repo for a working production example.

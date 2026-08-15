FROM oven/bun:1-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY package.json bun.lock .npmrc ./
RUN --mount=type=secret,id=github_token \
    GITHUB_PACKAGES_TOKEN="$(cat /run/secrets/github_token 2>/dev/null || true)" \
    bun install --frozen-lockfile
COPY . .
RUN bun run build && bun run scripts/csp-hashes.ts

FROM nginx:alpine
COPY nginx.conf /tmp/nginx.conf
COPY --from=builder /app/docs/.vitepress/dist/ /usr/share/nginx/html/
COPY --from=builder /app/csp-script-src.txt /tmp/csp-script-src.txt
RUN HASHES="$(cat /tmp/csp-script-src.txt)" \
    && sed "s|__SCRIPT_SRC_HASHES__|${HASHES}|" /tmp/nginx.conf > /etc/nginx/conf.d/default.conf \
    && grep -q "sha256-" /etc/nginx/conf.d/default.conf \
    && ! grep -q "__SCRIPT_SRC_HASHES__" /etc/nginx/conf.d/default.conf \
    && rm /tmp/nginx.conf /tmp/csp-script-src.txt
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]

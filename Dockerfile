FROM oven/bun:1-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build && bun run scripts/csp-hashes.ts \
    && HASHES="$(cat csp-script-src.txt)" \
    && sed "s|__SCRIPT_SRC_HASHES__|${HASHES}|" nginx.conf > default.conf \
    && grep -q "sha256-" default.conf \
    && ! grep -q "__SCRIPT_SRC_HASHES__" default.conf

# nginx-unprivileged runs as uid 101 and keeps its pid and temp files under
# /tmp, so the container needs no capabilities and works with a read-only
# root filesystem (base-service step-2 defaults).
FROM nginxinc/nginx-unprivileged:1.31-alpine
COPY --from=builder /app/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/docs/.vitepress/dist/ /usr/share/nginx/html/
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost:8080/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]

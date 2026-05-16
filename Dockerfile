FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=secret,id=github_token \
    GITHUB_PACKAGES_TOKEN="$(cat /run/secrets/github_token 2>/dev/null || true)" \
    npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/docs/.vitepress/dist/ /usr/share/nginx/html/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]

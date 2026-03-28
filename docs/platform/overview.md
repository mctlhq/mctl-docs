# What is MCTL?

MCTL is an AI-native infrastructure management platform that lets you control Kubernetes infrastructure through natural language, REST APIs, or a developer portal.

## The Problem

Managing Kubernetes is complex. Teams need to:
- Write and maintain Helm charts, Kustomize overlays, and ArgoCD configs
- Handle networking, TLS, DNS, and ingress rules
- Set up RBAC, resource quotas, and namespace isolation
- Monitor deployments, troubleshoot failures, and perform rollbacks

This requires deep platform engineering expertise that most teams don't have.

## The Solution

MCTL abstracts the complexity behind a unified control plane:

- **Natural language** — connect Claude, Cursor, or VS Code via MCP and manage infrastructure conversationally
- **REST API** — integrate with CI/CD pipelines, scripts, and custom tooling
- **Developer Portal** — Backstage-powered UI for browsing services, tenants, and operations
- **GitOps** — every change is a Git commit, synced by ArgoCD with full audit trail

## How It Works

1. **You make a request** — via MCP tool, API call, or portal action
2. **MCTL API processes it** — validates auth, checks RBAC, generates the desired state
3. **GitOps repo is updated** — the change is committed to `mctl-gitops`
4. **ArgoCD syncs** — detects the diff and applies it to the cluster
5. **Operation completes** — you can track progress via the operation ID

Every action is an async **operation** with a trackable ID. You can check status, view logs, and see the full history of changes.

## Core Principles

**GitOps-first** — the Git repository is the single source of truth. No imperative `kubectl apply` commands.

**Multi-tenant** — each team gets isolated namespaces with RBAC policies and resource quotas. No cross-tenant access.

**AI-native** — built from the ground up for AI interaction. The MCP server exposes 39 tools covering the full platform lifecycle.

**Self-healing** — the mctl-agent watches AlertManager and automatically creates PRs to fix common issues.

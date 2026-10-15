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
- **GitOps** — declared service configuration is committed to Git and reconciled by ArgoCD

## How It Works

1. **You make a request** — via MCP tool, API call, or portal action
2. **The API or portal processes it** — validates access and submits the relevant workflow
3. **The workflow runs** — builds/provisions resources and commits service configuration to `mctl-gitops`
4. **ArgoCD syncs** — detects the diff and applies it to the cluster
5. **Operation completes** — you can track progress via the operation ID

Workflow-backed writes return a workflow name. Reads and registry updates can complete synchronously; their responses and persistence differ by operation.

## Core Principles

**GitOps-first** — Git owns declared service configuration. Provisioning, previews, secrets and registry state also use their dedicated workflows and stores.

**Multi-tenant** — each team gets isolated namespaces with RBAC policies and resource quotas. Access is governed by policy on a shared cluster.

**AI-native** — built from the ground up for AI interaction. The MCP server exposes tools according to the deployed version and caller permissions.

**Self-healing** — the mctl-agent watches AlertManager and can propose fixes and open PRs for review.

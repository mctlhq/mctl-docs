# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

**Email:** security@mctl.ai

**Response time:** We will acknowledge your report within 48 hours and provide a detailed response within 5 business days.

**Please do NOT:**
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

## Supported Versions

Only the latest release is supported with security updates.

## Scope

This policy applies to all repositories in the mctlhq organization, including:
- mctl-api
- mctl-web
- mctl-docs
- mctl-gitops
- mctl-portal
- mctl-agent

## Content-Security-Policy

`docs.mctl.ai` serves a static VitePress site behind nginx.

- `script-src` uses per-build SHA-256 hashes of VitePress inline boot scripts (no `'unsafe-inline'`). Hashes are generated at image build from the HTML nginx will serve.
- Residual: `style-src` keeps `'unsafe-inline'` because VitePress/Vue emit inline style attributes. Removing it breaks layout.
- Theme tokens load from `https://ui.mctl.ai` (allow-listed on `style-src`).

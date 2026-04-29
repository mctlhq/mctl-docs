# Architecture Decision Records

This directory holds ADRs for the mctl-docs site itself — the documentation
portal at `docs.mctl.ai`. Records are written in Markdown, numbered
sequentially, and stored under `context/decisions/`.

These ADRs are **internal** to the mctl-docs repository — they are not
published as part of the rendered VitePress site. Their purpose is to capture
the context behind changes to the docs stack (VitePress version, theme,
dependencies, deploy pipeline) so future maintainers don't need to reverse
engineer past decisions from git history.

## Format

Each ADR file follows the lightweight Nygard template:

- **Status** — proposed / accepted / superseded / deprecated
- **Date** — ISO date the decision was recorded
- **Context** — what forced this decision
- **Decision** — what we chose
- **Consequences** — trade-offs and follow-ups

Filenames use the pattern `NNNN-short-slug.md` where `NNNN` is a
zero-padded sequence number.

## Index

| ID | Title | Status |
|----|-------|--------|
| 0003 | [VitePress 1.6 → 2.x Upgrade Strategy](./0003-vitepress-2-upgrade-strategy.md) | proposed |

# Preview Environments

Deploy temporary preview environments for pull requests or feature branches.

## Create a Preview

```
"Create a preview of my-app from ghcr.io/myorg/my-app:pr-42 in staging"
```

The `mctl_create_preview` tool:
1. Deploys a temporary instance of the service
2. Assigns a unique preview URL
3. Returns the preview URL and operation ID

## List Previews

```
"Show me all previews in the staging tenant"
```

## Delete a Preview

```
"Delete the preview pr-42 for my-app in staging"
```

Preview environments are isolated from production services and share the tenant's resource quotas.

<!-- TODO: Document preview lifecycle, auto-cleanup, and integration with GitHub PR webhooks -->

# Custom Domains

Add custom domains to your services with automatic TLS certificate provisioning.

## Add a Custom Domain

```
"Add domain api.example.com to my-app in the staging tenant"
```

The `mctl_add_custom_domain` tool:
1. Creates an ingress rule for the domain
2. Configures cert-manager to provision a TLS certificate
3. Returns DNS configuration instructions

## Verify a Domain

After adding a domain, you need to configure DNS to point to the cluster ingress:

```
"Verify domain api.example.com for my-app in staging"
```

The `mctl_verify_domain` tool checks that DNS is correctly configured and the TLS certificate has been issued.

## List Domains

```
"Show me all domains for the staging tenant"
```

## Remove a Domain

```
"Remove domain api.example.com from my-app in staging"
```

## DNS Configuration

When you add a custom domain, you'll need to create a CNAME record pointing to the cluster ingress. The exact target will be provided in the tool response.

| Record Type | Name | Value |
|-------------|------|-------|
| CNAME | `api.example.com` | *(provided by MCTL)* |

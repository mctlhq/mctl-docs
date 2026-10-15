# Custom Domains

Custom domains use registration, DNS ownership verification and an asynchronous
GitOps workflow to configure ingress and TLS.

## Add a Custom Domain

```text
Add domain api.example.com to my-app in staging
```

`mctl_add_custom_domain` registers the domain and returns `challenge_record`,
`challenge_value` and `cname_target`. Registration alone does not create ingress
or issue a certificate. Adding and verifying require the developer role.

## DNS Configuration

Create the returned TXT ownership challenge and point the hostname at the returned
CNAME target (normally `<team>-<service>.mctl.ai`). Use the actual response values.
An unproxied CNAME pointing directly at that target is also accepted as ownership
proof. For proxied DNS, use the TXT challenge because the proxy may hide the CNAME.

## Verify a Domain

```text
mctl_verify_domain(team="staging", service="my-app")
```

The tool checks registered domains for this service. Successful ownership
verification triggers the add-custom-domain workflow to update ingress and TLS.
Verification is a write operation; it does not prove the certificate is already
issued. Track the returned workflow and check domain/service status before testing
HTTPS. DNS and certificate issuance can take additional time.

## List Domains

```text
List domains for staging
```

## Remove a Domain

Removing a domain requires the owner role. The tool removes its registry entry
and submits ingress cleanup when needed. Track any returned workflow before
assuming routing has been removed.

```text
Remove domain api.example.com from my-app in staging
```

## Platform hostnames

The platform domain and its subdomains cannot be self-registered through this
API. Operators configure these hosts through GitOps ingress values instead.

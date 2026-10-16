# kubectl Access

Tenant developers can inspect their own namespaces with `kubectl`, signing in
with the same MCTL account they use for Argo CD and Vault. There is no
long-lived token to keep: `kubectl` opens a browser sign-in when it needs one.

## What you can do

Access is namespaced to your tenant and deliberately narrow:

| Allowed | Not allowed |
|---------|-------------|
| `get`, `list`, `watch` pods, deployments, statefulsets, replicasets, jobs, cronjobs, services, endpoints, ingresses, network policies, configmaps, PVCs, events | reading Secrets |
| `kubectl logs` | `kubectl exec`, `attach`, `port-forward` |
| `kubectl top pods` | editing, scaling or patching workloads |
| `kubectl delete pod` (the controller recreates it) | anything outside your tenant's namespaces |

To change what runs, change Git: bump the image tag or values in your tenant's
apps repository and let Argo CD sync it. To restart a workload, use **Restart**
on the Deployment or StatefulSet in the Argo CD UI.

## Getting access

kubectl access is opt-in per user. Ask a platform admin to enable it for your
account; tenant membership alone does not grant it. Once enabled, sign-in
works within about an hour.

## Setup

1. Install the [kubelogin](https://github.com/int128/kubelogin) plugin, which
   handles the browser sign-in for `kubectl`:

   ```bash
   brew install kubelogin
   # or, with krew:
   kubectl krew install oidc-login
   ```

2. Sign in to Vault and save your tenant's kubeconfig:

   ```bash
   export VAULT_ADDR=https://secrets.mctl.ai
   vault login -method=oidc -path=mctl
   vault kv get -field=kubeconfig secret/teams/<tenant>/kubectl > ~/.kube/mctl.yaml
   chmod 600 ~/.kube/mctl.yaml
   export KUBECONFIG=~/.kube/mctl.yaml
   ```

   The file holds no credentials: only the API server address, its CA
   certificate and the sign-in settings. It is kept in Vault so that only
   tenant members can read it.

3. Run any command:

   ```bash
   kubectl get pods
   ```

   The first command opens a browser at `auth.mctl.ai`. After you sign in,
   kubelogin caches the token and refreshes it silently; the browser opens
   again only when your session ends.

## Troubleshooting

**`Forbidden` on a command you expect to work.** Check the table above:
Secrets, `exec` and `port-forward` are refused by design. For other resources,
make sure you are in your tenant's namespace (`kubectl config view --minify`).

**The browser says you have no access to the application.** kubectl access is
not enabled for your account yet; see [Getting access](#getting-access).

**`Unauthorized` right after a cluster restart.** The cluster's sign-in check
needs a minute to come back; retry shortly.

**Port 8000 is busy.** kubelogin falls back to port 18000 automatically.

**Signing in as someone else.** Clear the cached token and run any command:

```bash
rm -rf ~/.kube/cache/oidc-login
```

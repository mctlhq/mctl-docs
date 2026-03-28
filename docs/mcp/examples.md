# MCP Examples

Real-world examples of managing infrastructure through natural language.

## Getting Oriented

```
"Who am I on MCTL?"
"What tenants do I have access to?"
"Show me all services in the production tenant"
```

## Deploying a Service

```
"Deploy my-api from ghcr.io/myorg/my-api:2.1.0 to the staging tenant"
"What's the status of that deployment?"
"Show me logs for my-api in staging"
```

## Investigating Issues

```
"Are there any open incidents?"
"Show me details of incident INC-42"
"What's the resource usage for my-api in production?"
"Get the last 200 lines of logs for my-api in production"
```

## Scaling and Performance

```
"Scale my-api to 5 replicas in production"
"Get resource sizing recommendations for my-api in staging"
"Apply the recommended resource profile to my-api"
```

## Managing Domains

```
"Add domain api.example.com to my-api in the production tenant"
"Verify domain api.example.com for my-api in production"
"List all domains in the production tenant"
```

## Preview Environments

```
"Create a preview of my-frontend from ghcr.io/myorg/my-frontend:pr-123 in staging"
"List all previews in staging"
"Delete the preview for PR 123"
```

## Incident Response

```
"Show me a summary of all incidents"
"Acknowledge incident INC-42"
"Resolve incident INC-42"
```

## Multi-Step Workflows

You can chain operations naturally:

```
"Deploy my-api version 3.0.0 to staging, wait for it to be healthy,
then check the logs to make sure there are no errors"
```

```
"Check if there are any incidents in production. If there are,
show me the details and the logs for the affected services"
```

```
"Scale my-api to 3 replicas in staging and add the domain
api-staging.example.com to it"
```

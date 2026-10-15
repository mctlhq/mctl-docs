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
"Onboard my-api from repo myorg/my-api tag 2.1.0 port 8080 for staging"
"What's the status of that deployment?"
"Show me logs for my-api in staging"
```

## Investigating Issues

```
"Are there any open incidents?"
"Show me details of incident INC-42"
"What's the namespace resource usage for production?"
"Get the last 200 lines of logs for my-api in production"
```

## Scaling and Performance

```
"Enable autoscaling for my-api in production with min 2, max 5 replicas and CPU threshold 80"
"Show me namespace resource usage for staging"
```

## Managing Domains

```
"Add domain api.example.com to my-api in the production tenant"
"Verify domain api.example.com for my-api in production"
"List all domains in the production tenant"
```

## Preview Environments

```
"Create a preview of my-frontend at image tag pr-123 in staging"
"List all previews in staging"
"List previews in staging, then delete the selected preview using its preview_id"
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
"Configure autoscaling for my-api in staging with min 1 and max 3 replicas, then register the domain
api-staging.example.com to it"
```

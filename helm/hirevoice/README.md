# HireVoice Helm chart

This chart deploys HireVoice application workloads to the existing EKS cluster.

It expects these Kubernetes Secrets to already exist in the target namespace:

- `rds-credentials` with `DB_USER` and `DB_PASSWORD`
- `jwt-secret` with `JWT_SECRET`
- `groq-api-key` with `GROQ_API_KEY`

Render without deploying:

```powershell
helm template hirevoice .\helm\hirevoice
```

Deploy later:

```powershell
helm upgrade --install hirevoice .\helm\hirevoice --namespace hirevoice --create-namespace
```

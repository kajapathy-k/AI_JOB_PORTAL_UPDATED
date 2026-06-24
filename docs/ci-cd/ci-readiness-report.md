# HireVoice CI Readiness Report

Repository: `kajapathy-k/AI_JOB_PORTAL_UPDATED`

Branch: `eks-migration`

## Review Summary

The modular GitHub Actions architecture is structurally ready for the first CI run after two CI-only updates:

- `build.yml` now includes `eks-migration` as a temporary push trigger.
- `oidc-test.yml` provides a manual AWS OIDC smoke test that runs `aws sts get-caller-identity` and uploads the result.
- `sonarqube.yml` now supports SonarCloud by passing `sonar.organization` when `SONAR_HOST_URL` points at `sonarcloud.io`.

No application source code, Kubernetes manifests, Helm chart functionality, Terraform infrastructure resources, or ArgoCD resources were modified.

## Required Repository Secrets

| Secret | Required | Used By | Purpose |
| --- | --- | --- | --- |
| `SONAR_TOKEN` | Yes | `sonarqube.yml` | Authenticates SonarCloud scan and Quality Gate checks |
| `SNYK_TOKEN` | Yes | `snyk.yml` | Authenticates Snyk dependency scans |
| `SMTP_SERVER` | Optional | `send-notification` | Email notification SMTP host |
| `SMTP_PORT` | Optional | `send-notification` | Email notification SMTP port |
| `SMTP_USERNAME` | Optional | `send-notification` | Email notification SMTP username |
| `SMTP_PASSWORD` | Optional | `send-notification` | Email notification SMTP password |

If SMTP values are missing, the notification action logs the status and skips email delivery.

## Required Repository Variables

| Variable | Required | Used By | Purpose |
| --- | --- | --- | --- |
| `AWS_ROLE_TO_ASSUME` | Yes | `oidc-test.yml`, `ecr-push.yml`, Terraform workflows | IAM role ARN assumed through GitHub OIDC |
| `AWS_REGION` | Yes | `oidc-test.yml`, `ecr-push.yml`, `helm-validate.yml` | AWS region, expected `us-east-1` |
| `AWS_ACCOUNT_ID` | Yes | `helm-validate.yml` | ECR registry account used when rendering image references |
| `BACKEND_ECR_REPOSITORY` | Yes | `ecr-push.yml`, `helm-validate.yml` | Backend ECR repository name |
| `FRONTEND_ECR_REPOSITORY` | Yes | `ecr-push.yml`, `helm-validate.yml` | Frontend ECR repository name |
| `SONAR_HOST_URL` | Yes | `sonarqube.yml` | SonarCloud URL, expected `https://sonarcloud.io` |
| `SONAR_PROJECT_KEY` | Yes | `sonarqube.yml` | SonarCloud project key |
| `SONAR_PROJECT_NAME` | Yes | `sonarqube.yml` | SonarCloud project display name |
| `SONAR_ORGANIZATION` | Yes for SonarCloud | `sonarqube.yml` | SonarCloud organization key |
| `SNYK_SEVERITY_THRESHOLD` | Optional | `snyk.yml` | Defaults to `critical` |
| `VITE_API_URL` | Optional | `docker-build.yml` | Defaults to `/api` |
| `NOTIFICATION_EMAIL_TO` | Optional | `send-notification` | Email notification recipient |
| `NOTIFICATION_EMAIL_FROM` | Optional | `send-notification` | Email notification sender |

Missing variable found during review: `SONAR_ORGANIZATION` was not listed in the completed setup, but SonarCloud normally requires it.

## Expected Pipeline Execution Order

```text
build.yml
  -> sonarqube.yml
  -> snyk.yml
  -> docker-build.yml
  -> trivy.yml
  -> ecr-push.yml
  -> helm-validate.yml
  -> send-notification composite action
```

Security gates stop downstream execution:

- SonarCloud Quality Gate failure stops Snyk, Docker, Trivy, ECR, and Helm.
- Snyk failure stops Docker, Trivy, ECR, and Helm.
- Trivy failure stops ECR and Helm.
- ECR push is skipped on pull requests.

## workflow_call Wiring

| Caller | Called Workflow | Inputs / Outputs Verified |
| --- | --- | --- |
| `build.yml` | `sonarqube.yml` | Passes `sonar_host_url`, `sonar_project_key`, `sonar_project_name`, `sonar_organization`; uses `secrets: inherit` |
| `build.yml` | `snyk.yml` | Passes `severity_threshold`; uses `secrets: inherit` |
| `build.yml` | `docker-build.yml` | Passes `image_tag`, `vite_api_url`; consumes outputs in later jobs |
| `docker-build.yml` | `build.yml` | Exposes `backend_image`, `frontend_image`, `backend_image_artifact`, `frontend_image_artifact` |
| `build.yml` | `trivy.yml` | Passes Docker image refs and artifact names from Docker build outputs |
| `build.yml` | `ecr-push.yml` | Passes AWS OIDC inputs and the same Docker image artifacts scanned by Trivy |
| `build.yml` | `helm-validate.yml` | Passes AWS account, region, repositories, and `github.sha` image tag |

## Docker, Trivy, and ECR Artifact Flow

`docker-build.yml` builds these local image refs:

```text
hirevoice-backend:${{ github.sha }}
hirevoice-frontend:${{ github.sha }}
```

It exports them as artifacts:

```text
hirevoice-backend-image-${{ github.sha }}
hirevoice-frontend-image-${{ github.sha }}
```

`trivy.yml` downloads those exact artifacts, runs `docker load`, and scans the loaded local images.

`ecr-push.yml` downloads the same artifacts, runs `docker load`, retags the images for ECR, and pushes them after all security gates pass.

## AWS OIDC Verification

`oidc-test.yml` validates the OIDC path independently:

1. Checks `AWS_ROLE_TO_ASSUME` and `AWS_REGION`.
2. Runs `aws-actions/configure-aws-credentials@v4`.
3. Runs `aws sts get-caller-identity`.
4. Uploads `aws-oidc-sts-caller-identity` as an artifact.

Expected caller identity should show the configured `GitHubActionsRole` account and assumed-role ARN.

## Helm Validation

`helm-validate.yml` is syntactically wired correctly:

- `helm lint helm/hirevoice`
- `helm template helm/hirevoice`
- Uploads `helm-rendered-manifests`

Risk found: `helm/` is currently untracked in the local working tree after the secret-history cleanup. If `helm/hirevoice` is not committed on `eks-migration` before the CI run, the GitHub runner checkout will not contain the chart and Helm validation will fail with a missing chart path.

## Potential Failure Points

1. `SONAR_ORGANIZATION` missing for SonarCloud.
2. SonarCloud Quality Gate can fail if the project gate is stricter than current code quality.
3. Snyk can fail if backend or frontend dependencies contain vulnerabilities at or above `SNYK_SEVERITY_THRESHOLD`.
4. Docker builds depend on remote package registries during `pip install` and `npm ci`.
5. Trivy can fail on HIGH or CRITICAL findings in OS or library layers.
6. ECR push can fail if the OIDC IAM role lacks ECR push permissions.
7. Helm validation will fail if `helm/hirevoice` is not present in the committed branch.
8. Email notification delivery is skipped unless all SMTP settings and email variables are configured.
9. `workflow_dispatch` workflows may need the workflow file to be visible in GitHub Actions before they can be manually selected.

## Exact Steps for First CI Run

1. Add the missing SonarCloud variable:

```text
SONAR_ORGANIZATION=<your SonarCloud organization key>
```

2. Commit and push the CI readiness changes.

3. Run the OIDC smoke test from GitHub Actions:

```text
Workflow: AWS OIDC Test
Ref: eks-migration
Expected artifact: aws-oidc-sts-caller-identity
```

4. Push to `eks-migration` to trigger the full CI pipeline.

5. Review artifacts in this order:

```text
sonarqube-scanner-report
snyk-reports
hirevoice-backend-image-<sha>
hirevoice-frontend-image-<sha>
trivy-reports
helm-rendered-manifests
```

6. If ECR push succeeds, verify images exist:

```text
768979069805.dkr.ecr.us-east-1.amazonaws.com/hirevoice-backend:<commit-sha>
768979069805.dkr.ecr.us-east-1.amazonaws.com/hirevoice-frontend:<commit-sha>
```

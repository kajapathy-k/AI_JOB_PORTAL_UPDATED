# CI/CD Branch Migration Execution

Date: 2026-06-24

AWS account: `334401495505`
Cluster: `hirevoice-dev-eks`
Deployment branch: `personal-account-gitops`

## Goal

Align GitHub Actions deployment automation with the ArgoCD deployment branch.

Before this migration, ArgoCD deployed `personal-account-gitops`, but GitHub Actions CD was still targeting `eks-migration`. That mismatch meant a successful CI run could push image tag updates to a branch ArgoCD was not using.

## Workflow Changes

| File | Change |
| --- | --- |
| `.github/workflows/build.yml` | Replaced the `eks-migration` push trigger with `personal-account-gitops` |
| `.github/workflows/build.yml` | Replaced the old account fallback `768979069805` with `334401495505` |
| `.github/workflows/deploy.yml` | Replaced workflow-run branch filter `eks-migration` with `personal-account-gitops` |
| `.github/workflows/deploy.yml` | Replaced deploy job branch condition with `personal-account-gitops` |
| `.github/workflows/deploy.yml` | Replaced `DEPLOY_BRANCH=eks-migration` with `DEPLOY_BRANCH=personal-account-gitops` |

## Verified Targets

| Item | Value | Status |
| --- | --- | --- |
| AWS account | `334401495505` | Verified in workflow fallback and Helm values |
| EKS cluster | `hirevoice-dev-eks` | Verified in CD workflow |
| Backend ECR repository | `hirevoice-backend` | Verified in CI defaults and Helm values |
| Frontend ECR repository | `hirevoice-frontend` | Verified in CI defaults and Helm values |
| Backend image registry | `334401495505.dkr.ecr.us-east-1.amazonaws.com/hirevoice-backend` | Verified |
| Frontend image registry | `334401495505.dkr.ecr.us-east-1.amazonaws.com/hirevoice-frontend` | Verified |
| ArgoCD branch | `personal-account-gitops` | Verified in app manifests |

## Branch References After Migration

Expected active branch references:

- CI push branch: `personal-account-gitops`
- CD workflow-run branch: `personal-account-gitops`
- CD deploy branch: `personal-account-gitops`
- ArgoCD app target revisions: `personal-account-gitops`

The old account ID `768979069805` must not appear in `.github/workflows/`.

## Validation Commands

```powershell
rg -n "eks-migration|768979069805" .github/workflows
rg -n "personal-account-gitops|334401495505|hirevoice-dev-eks|hirevoice-backend|hirevoice-frontend" .github/workflows apps helm
git diff -- .github/workflows/build.yml .github/workflows/deploy.yml docs/cicd-branch-migration-execution.md
```

## Deployment Safety

This migration changes workflow branch wiring only. It does not modify Terraform, Route53, ACM, Kubernetes manifests, Helm templates, or AWS resources.

The migration commit should use `[skip ci]` to avoid triggering deployment while the branch wiring itself is being changed.

## Final Verdict

`CICD_BRANCH_MIGRATION_COMPLETE`

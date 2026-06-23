# Terraform Pipeline

This document describes the Terraform CI/CD automation added for HireVoice.
It is intentionally separate from the application CI/CD pipeline so Terraform
changes can be reviewed without affecting Docker builds, ArgoCD, or Kubernetes
deployments.

## Workflow Architecture

The dedicated workflow is `.github/workflows/terraform-ci.yml`.

It runs a single Terraform validation job by reusing
`.github/workflows/terraform-plan.yml`. The reusable workflow performs:

1. `terraform fmt -check -recursive`
2. `terraform init -input=false`
3. `terraform validate -no-color`
4. `terraform plan -input=false -no-color`
5. `terraform show -no-color` and plan artifact upload

Normal pushes and pull requests only run plan validation. They do not run
`terraform apply`.

Manual apply remains isolated in `.github/workflows/terraform-apply.yml`.
That workflow is `workflow_dispatch` only and uses a GitHub Environment approval
gate before applying the reviewed plan.

## Trigger Paths

`Terraform CI` runs only when Terraform source paths change:

- `terraform/**`
- `modules/**`

It also supports manual execution with `workflow_dispatch`.

Application workflows are not changed. `HireVoice CI` and `HireVoice CD` keep
their existing triggers and are not called by this Terraform workflow.

## Required Variables And Secrets

Repository or environment variables:

- `AWS_REGION`: AWS region, defaults to `us-east-1` when omitted.
- `AWS_ROLE_TO_ASSUME`: IAM role ARN assumed by GitHub Actions through OIDC.

Repository or environment secrets:

- `GROQ_API_KEY`: supplied to Terraform as `TF_VAR_groq_api_key`.
  Terraform CI plan runs can use a non-production placeholder when this secret
  is unavailable. Manual apply planning requires the real secret and fails fast
  when it is missing.

GitHub Environment:

- The manual apply workflow should use a protected environment such as
  `production` or `terraform-apply`.
- Require reviewer approval on that environment before any apply job can start.

## Remote State Recommendation

The current Terraform root does not define a remote backend. For capstone-ready
operation, move Terraform state to an encrypted S3 backend with DynamoDB locking
before using automated apply.

Recommended backend shape:

```hcl
terraform {
  backend "s3" {
    bucket         = "hirevoice-terraform-state"
    key            = "hirevoice/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "hirevoice-terraform-locks"
    encrypt        = true
  }
}
```

Recommended controls:

- Enable S3 bucket versioning.
- Enable S3 default encryption.
- Block public access on the state bucket.
- Use a DynamoDB table with `LockID` as the partition key.
- Restrict state bucket and lock table access to the Terraform CI/CD role.
- Run `terraform init -migrate-state` only during a planned maintenance window.

This branch does not enable the backend automatically because backend migration
changes Terraform state behavior and should be reviewed separately.

## Rollback Plan

If the Terraform CI workflow causes problems:

1. Disable `Terraform CI` in GitHub Actions or revert the workflow commit.
2. Confirm application CI/CD is unaffected.
3. Because push and pull-request runs do not apply infrastructure changes, no
   production rollback is required for the CI workflow itself.

If a future manual apply causes an infrastructure issue:

1. Stop further manual applies.
2. Revert the Terraform configuration change.
3. Restore the previous Terraform state version if using S3 versioning.
4. Run `terraform plan` and review the rollback plan.
5. Apply only through the protected manual approval workflow.

## Capstone Alignment

This implementation improves the infrastructure pipeline requirement by adding
automated Terraform formatting, validation, initialization, and planning on
Terraform-only changes.

Remaining infrastructure automation improvement:

- Configure S3 remote state and DynamoDB locking.

# Terraform Capstone Gap Analysis

Date: 2026-06-23
Branch: `terraform-pipeline`

## Current Status

The Terraform infrastructure pipeline is implemented and verified for CI.

Verified GitHub Actions run:

- Workflow: `Terraform CI`
- Run ID: `28031490535`
- URL: <https://github.com/kajapathy-k/AI_JOB_PORTAL_UPDATED/actions/runs/28031490535>
- Branch: `terraform-pipeline`
- Commit: `4ea173ad3d414d908c5f349f9992323b6f801194`

Verified stages:

| Stage | Status |
| --- | --- |
| GitHub OIDC authentication | Passed |
| `terraform fmt -check -recursive` | Passed |
| `terraform init -input=false` | Passed |
| `terraform validate -no-color` | Passed |
| `terraform plan -no-color` | Passed |
| Plan artifact upload | Passed |

No `terraform apply` was executed during verification.

## Capstone Compliance Assessment

The capstone baseline requires an infrastructure pipeline that can validate,
plan, display the plan, require manual approval, and apply only after approval.

| Requirement | Status | Evidence | Gap |
| --- | --- | --- | --- |
| Terraform workflow exists | Satisfied | `.github/workflows/terraform-ci.yml`, `.github/workflows/terraform-plan.yml`, `.github/workflows/terraform-apply.yml` | None |
| Trigger on Terraform changes | Satisfied | `terraform-ci.yml` uses path filters for `terraform/**` and `modules/**` | Apply is intentionally manual-only |
| `terraform fmt -check` | Satisfied | `terraform-plan.yml`; successful run `28031490535` | None |
| `terraform init` | Satisfied | `terraform-plan.yml`; successful run `28031490535` | None |
| `terraform validate` | Satisfied | `terraform-plan.yml`; successful run `28031490535` | None |
| `terraform plan` | Satisfied | `terraform-plan.yml`; successful run `28031490535` | None |
| Plan review artifact | Satisfied | `terraform-plan.yml` uploads `artifacts/terraform/**` | None |
| GitHub OIDC | Satisfied | `permissions.id-token: write`; `aws-actions/configure-aws-credentials@v4` | None |
| GitHubActionsRole | Satisfied | Workflow uses `${{ vars.AWS_ROLE_TO_ASSUME }}`; verified with `GitHubActionsRole` | Ensure repository variable remains set |
| Manual apply workflow | Satisfied | `terraform-apply.yml` uses `workflow_dispatch` | None |
| Manual approval before apply | Satisfied by workflow design | `terraform-apply.yml` uses `environment: ${{ inputs.environment || 'production' }}` | GitHub environment protection reviewers must remain configured in repository settings |
| Apply after approval | Satisfied by workflow design | `terraform-apply.yml` downloads reviewed plan and runs `terraform apply` | Not executed during this assessment |
| Remote S3 backend | Missing | No `backend "s3"` block in `terraform/*.tf` | Migration required |
| DynamoDB state locking | Missing | No backend lock table configuration in `terraform/*.tf` | Migration required |

## Terraform Apply Workflow Assessment

`terraform-apply.yml` already exists and is implemented correctly for a
manual approval model.

Evidence:

- Uses `workflow_dispatch`.
- Does not run automatically on push.
- Uses `permissions.id-token: write`.
- Uses `aws-actions/configure-aws-credentials@v4`.
- Reads the role ARN from `${{ vars.AWS_ROLE_TO_ASSUME }}`.
- Reuses `terraform-plan.yml` before apply.
- Requires real Terraform secrets for apply planning.
- Uses a GitHub Environment gate through `environment`.
- Runs `terraform apply -input=false -auto-approve` against the reviewed saved plan.

No additional apply workflow is needed.

## IAM Remediation Applied For Plan

Terraform CI needed read-only AWS permissions for provider data-source reads.
The least-privilege inline policy `HireVoiceTerraformPlanReadOnly` was attached
to `GitHubActionsRole`.

Granted actions:

```text
ec2:DescribeAvailabilityZones
elasticloadbalancing:DescribeLoadBalancers
elasticloadbalancing:DescribeLoadBalancerAttributes
elasticloadbalancing:DescribeTags
```

No write permissions were added.

AWS managed `ReadOnlyAccess` was not attached. It would have been faster, but it
grants broad account-wide read access. The scoped inline policy was sufficient
for the verified Terraform plan.

## Backend Configuration Assessment

Terraform currently uses local state by default.

Evidence:

- `terraform/versions.tf` defines `terraform` and provider requirements.
- No `backend "s3"` block exists in `terraform/*.tf`.
- No DynamoDB lock table is configured.
- `terraform/README.md` recommends S3 plus DynamoDB, but does not implement it.

This is the remaining Terraform capstone gap.

## Backend Migration Plan

Do not migrate state during normal application deployment. Treat backend
migration as a controlled infrastructure maintenance task.

Recommended execution order:

1. Create an S3 bucket for Terraform state.
2. Enable bucket versioning.
3. Enable bucket default encryption.
4. Block public access on the bucket.
5. Create a DynamoDB table for state locking.
6. Add `terraform/backend.tf`.
7. Run `terraform init -migrate-state`.
8. Run `terraform plan`.
9. Confirm the plan does not unexpectedly create, replace, or destroy resources.
10. Update Terraform documentation with backend names and recovery notes.

## Backend.tf Proposal

Do not commit this until the S3 bucket and DynamoDB table exist and the team is
ready to migrate state.

```hcl
terraform {
  backend "s3" {
    bucket         = "hirevoice-terraform-state-768979069805-us-east-1"
    key            = "hirevoice/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "hirevoice-terraform-locks"
    encrypt        = true
  }
}
```

## Required AWS Backend Resources

S3 bucket:

- Name: `hirevoice-terraform-state-768979069805-us-east-1`
- Region: `us-east-1`
- Versioning: enabled
- Default encryption: AES256 or KMS
- Public access: blocked

DynamoDB table:

- Name: `hirevoice-terraform-locks`
- Partition key: `LockID`
- Partition key type: string
- Billing mode: pay-per-request

Example creation commands for a future approved maintenance window:

```bash
aws s3api create-bucket \
  --bucket hirevoice-terraform-state-768979069805-us-east-1 \
  --region us-east-1

aws s3api put-bucket-versioning \
  --bucket hirevoice-terraform-state-768979069805-us-east-1 \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket hirevoice-terraform-state-768979069805-us-east-1 \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws s3api put-public-access-block \
  --bucket hirevoice-terraform-state-768979069805-us-east-1 \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws dynamodb create-table \
  --table-name hirevoice-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Migration Risk

Risk level: Medium.

Reasons:

- Existing local state may not exactly match recovered production resources.
- Terraform includes Route53, ACM, ECR, EKS, RDS, Helm, and Kubernetes-related resources.
- A state migration mistake can make future plans misleading.
- Remote backend migration changes how every future Terraform run reads and writes state.

Main risk controls:

- Back up local state before migration.
- Use a maintenance window.
- Run `terraform state list` before and after migration.
- Run `terraform plan` after migration and review the full diff.
- Do not run `terraform apply` until the migrated state is proven correct.

## Rollback Strategy

Before migration:

```bash
cd terraform
cp terraform.tfstate terraform.tfstate.pre-s3-migration.backup
cp terraform.tfstate.backup terraform.tfstate.backup.pre-s3-migration.backup
```

If migration fails before state is safely copied:

1. Remove or comment out `backend.tf`.
2. Run `terraform init -reconfigure`.
3. Restore the local `terraform.tfstate` backup if needed.
4. Run `terraform plan` and confirm expected behavior.

If migration succeeds but later state corruption is suspected:

1. Stop all Terraform workflows.
2. Use S3 bucket versioning to restore the previous state object version.
3. Confirm DynamoDB lock table has no stale lock.
4. Run `terraform init`.
5. Run `terraform plan`.
6. Resume workflows only after plan output is reviewed.

## Remaining Gaps

| Gap | Priority | Required Before Evaluation? | Recommendation |
| --- | --- | --- | --- |
| S3 remote backend | High | Yes for full Terraform capstone compliance | Implement in a separate backend migration task |
| DynamoDB locking | High | Yes for full Terraform capstone compliance | Implement with S3 backend migration |
| Apply workflow | Complete | Already satisfied | No new workflow needed |

## Final Classification

B) Remaining Terraform gaps:

- S3 backend
- DynamoDB locking

The Terraform workflow requirements are complete. The Terraform state backend
requirements are not yet complete.

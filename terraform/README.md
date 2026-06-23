# HireVoice Phase 1 Terraform

This stack creates the AWS foundation for validating HireVoice without Kubernetes.
It intentionally does not create EKS, ECR, Helm, ArgoCD, ALB, or CI/CD resources.

## Modules

- `networking`: VPC, internet gateway, NAT gateway, public subnets, private application subnets, private database subnets, route tables, and associations.
- `security_groups`: Application and database security groups.
- `rds`: Private encrypted PostgreSQL RDS instance with automated backups and a DB subnet group.
- `iam`: EC2 workload role and instance profile for future non-Kubernetes application hosts.
- `configuration`: SSM Parameter Store values and Secrets Manager secret for application configuration.

## Future EKS Compatibility

The networking module creates separate private application and database subnets.
Application subnets are tagged for internal load balancer discovery, and public
subnets are tagged for internet-facing load balancer discovery. Set
`eks_cluster_name` to add shared EKS cluster discovery tags before migration:

```hcl
eks_cluster_name = "hirevoice-dev"
```

No EKS resources are provisioned in Phase 1.

## Usage

```bash
cd terraform
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

Start from the example file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Terraform state will contain sensitive metadata. Use a remote backend with
encryption and locking, such as S3 plus DynamoDB, before using this beyond local
validation.

Verification trigger: Terraform CI check at 2026-06-23T19:07:08+05:30.
Verification retry: Terraform CI secret fallback check at 2026-06-23T19:09:44+05:30.
Verification diagnostic: Terraform CI plan annotation check at 2026-06-23T19:15:25+05:30.
Verification rerun: Terraform CI after IAM read-only remediation at 2026-06-23T19:21:52+05:30.
Verification rerun: Terraform CI after ELB attribute read permission at 2026-06-23T19:24:26+05:30.

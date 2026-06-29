# HireVoice Phase 1 Terraform

This stack creates the AWS foundation for validating HireVoice on AWS, including
core networking, compute, data, edge delivery, container platform, and
observability resources.

## Modules

- `networking`: VPC, internet gateway, NAT gateway, public subnets, private application subnets, private database subnets, route tables, and associations.
- `security_groups`: Application and database security groups.
- `rds`: Private encrypted PostgreSQL RDS instance with automated backups and a DB subnet group.
- `iam`: EC2 workload role and instance profile for future non-Kubernetes application hosts.
- `configuration`: SSM Parameter Store values and Secrets Manager secret for application configuration.
- `ecr`: Backend and frontend container registries.
- `eks`: EKS control plane, managed node group, and OIDC provider.
- `s3`: Versioned encrypted application document bucket.
- `dynamodb`: PAY_PER_REQUEST table for interview and application state.
- `efs`: Shared encrypted file system with private-subnet mount targets.
- `cloudfront`: CDN distribution in front of the ingress load balancer.
- `cloudtrail`: Multi-region audit trail with S3 and CloudWatch delivery.
- `waf`: Regional WAF web ACL attached to the application load balancer.
- `cloudwatch`: Operations dashboard and baseline alarms.

## Platform Notes

The networking module creates separate private application and database subnets.
Application subnets are tagged for internal load balancer discovery, and public
subnets are tagged for internet-facing load balancer discovery. The stack now
creates EKS resources directly and can also front the ALB with CloudFront.

```hcl
eks_cluster_name = "hirevoice-dev"
```

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

Terraform state will contain sensitive metadata. Configure your chosen remote
backend with encryption and locking before using this beyond local validation.

output "vpc_id" {
  description = "VPC ID."
  value       = module.networking.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs across two AZs."
  value       = module.networking.public_subnet_ids
}

output "private_app_subnet_ids" {
  description = "Private application subnet IDs across two AZs."
  value       = module.networking.private_app_subnet_ids
}

output "private_db_subnet_ids" {
  description = "Private database subnet IDs across two AZs."
  value       = module.networking.private_db_subnet_ids
}

output "application_security_group_id" {
  description = "Application security group ID."
  value       = module.security_groups.application_security_group_id
}

output "database_security_group_id" {
  description = "Database security group ID."
  value       = module.security_groups.database_security_group_id
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint."
  value       = module.rds.rds_endpoint
}

output "rds_port" {
  description = "RDS PostgreSQL port."
  value       = module.rds.rds_port
}

output "ecr_frontend_repository_url" {
  description = "ECR repository URL for the HireVoice frontend image."
  value       = module.ecr.frontend_repository_url
}

output "ecr_backend_repository_url" {
  description = "ECR repository URL for the HireVoice backend image."
  value       = module.ecr.backend_repository_url
}

output "ecr_repository_arns" {
  description = "ECR repository ARNs keyed by logical repository name."
  value       = module.ecr.repository_arns
}

output "eks_cluster_name" {
  description = "EKS cluster name."
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster API endpoint."
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_arn" {
  description = "EKS cluster ARN."
  value       = module.eks.cluster_arn
}

output "eks_oidc_provider_arn" {
  description = "EKS OIDC provider ARN for future IRSA integration."
  value       = module.eks.oidc_provider_arn
}

output "eks_node_group_name" {
  description = "EKS managed node group name."
  value       = module.eks.node_group_name
}

output "eks_node_security_group_id" {
  description = "Dedicated EKS node security group ID."
  value       = module.eks.node_security_group_id
}

output "frontend_instance_id" {
  description = "Frontend EC2 instance ID."
  value       = module.frontend_ec2.instance_id
}

output "frontend_public_ip" {
  description = "Frontend EC2 public IP."
  value       = module.frontend_ec2.public_ip
}

output "frontend_url" {
  description = "Frontend public URL."
  value       = module.frontend_ec2.public_url
}

output "backend_instance_id" {
  description = "Backend EC2 instance ID."
  value       = module.backend_ec2.instance_id
}

output "backend_private_ip" {
  description = "Backend EC2 private IP."
  value       = module.backend_ec2.private_ip
}

output "ec2_instance_profile_name" {
  description = "Instance profile for future EC2-hosted application workloads."
  value       = module.iam.ec2_instance_profile_name
}

output "configuration_parameter_path" {
  description = "SSM parameter path containing non-sensitive application configuration."
  value       = module.configuration.parameter_path
}

output "aws_load_balancer_controller_role_arn" {
  description = "AWS Load Balancer Controller IRSA role ARN."
  value       = module.aws_load_balancer_controller.iam_role_arn
}

output "aws_load_balancer_controller_policy_arn" {
  description = "AWS Load Balancer Controller IAM policy ARN."
  value       = module.aws_load_balancer_controller.iam_policy_arn
}

output "aws_load_balancer_controller_helm_release" {
  description = "AWS Load Balancer Controller Helm release name."
  value       = module.aws_load_balancer_controller.helm_release_name
}

output "route53_zone_id" {
  description = "Route53 hosted zone ID for the HireVoice root domain."
  value       = aws_route53_zone.primary.zone_id
}

output "route53_zone_name_servers" {
  description = "Route53 authoritative nameservers to configure at the domain registrar."
  value       = aws_route53_zone.primary.name_servers
}

output "hirevoice_domain_name" {
  description = "Custom domain name for the HireVoice application."
  value       = local.hirevoice_fqdn
}

output "hirevoice_acm_certificate_arn" {
  description = "ACM certificate ARN for the HireVoice custom domain."
  value       = aws_acm_certificate.hirevoice.arn
}

output "hirevoice_alb_dns_name" {
  description = "Existing ALB DNS name used by the HireVoice Route53 alias record."
  value       = data.aws_lb.hirevoice_ingress.dns_name
}

output "hirevoice_route53_alias_fqdn" {
  description = "Route53 alias record FQDN for HireVoice."
  value       = aws_route53_record.hirevoice_alias.fqdn
}

output "documents_bucket_name" {
  description = "S3 bucket for application documents and artifacts."
  value       = module.documents_bucket.bucket_name
}

output "documents_bucket_arn" {
  description = "S3 bucket ARN for application documents."
  value       = module.documents_bucket.bucket_arn
}

output "dynamodb_table_name" {
  description = "DynamoDB table used for interview/application state."
  value       = module.application_state_table.table_name
}

output "dynamodb_table_arn" {
  description = "DynamoDB table ARN."
  value       = module.application_state_table.table_arn
}

output "efs_file_system_id" {
  description = "Shared EFS filesystem ID."
  value       = module.shared_filesystem.file_system_id
}

output "efs_access_point_id" {
  description = "Shared EFS access point ID."
  value       = module.shared_filesystem.access_point_id
}

output "cloudtrail_arn" {
  description = "CloudTrail ARN."
  value       = module.audit_trail.trail_arn
}

output "cloudtrail_bucket_name" {
  description = "CloudTrail log bucket name."
  value       = module.audit_trail.bucket_name
}

output "cloudtrail_log_group_name" {
  description = "CloudTrail CloudWatch Logs group name."
  value       = module.audit_trail.log_group_name
}

output "waf_web_acl_arn" {
  description = "Regional WAF web ACL ARN protecting the ALB."
  value       = module.edge_waf.web_acl_arn
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID."
  value       = module.edge_cdn.distribution_id
}

output "cloudfront_distribution_domain_name" {
  description = "CloudFront distribution domain name."
  value       = module.edge_cdn.distribution_domain_name
}

output "cloudwatch_dashboard_name" {
  description = "Operations dashboard name."
  value       = module.operations_dashboard.dashboard_name
}

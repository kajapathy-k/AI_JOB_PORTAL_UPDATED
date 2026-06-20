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

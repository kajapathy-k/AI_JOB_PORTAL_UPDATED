output "file_system_id" {
  description = "EFS filesystem ID."
  value       = aws_efs_file_system.this.id
}

output "access_point_id" {
  description = "EFS access point ID."
  value       = aws_efs_access_point.this.id
}

output "security_group_id" {
  description = "EFS security group ID."
  value       = aws_security_group.this.id
}

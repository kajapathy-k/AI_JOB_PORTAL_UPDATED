output "trail_arn" {
  description = "CloudTrail ARN."
  value       = aws_cloudtrail.this.arn
}

output "bucket_name" {
  description = "CloudTrail log bucket name."
  value       = aws_s3_bucket.logs.id
}

output "log_group_name" {
  description = "CloudTrail CloudWatch Logs group name."
  value       = aws_cloudwatch_log_group.this.name
}

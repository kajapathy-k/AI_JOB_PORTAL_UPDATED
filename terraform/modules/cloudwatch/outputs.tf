output "dashboard_name" {
  description = "CloudWatch dashboard name."
  value       = aws_cloudwatch_dashboard.this.dashboard_name
}

output "rds_cpu_alarm_name" {
  description = "RDS CPU alarm name."
  value       = aws_cloudwatch_metric_alarm.rds_cpu_high.alarm_name
}

output "alb_5xx_alarm_name" {
  description = "ALB 5XX alarm name."
  value       = aws_cloudwatch_metric_alarm.alb_5xx_high.alarm_name
}

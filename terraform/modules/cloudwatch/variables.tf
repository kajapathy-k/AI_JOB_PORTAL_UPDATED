variable "name_prefix" {
  description = "Prefix used for naming."
  type        = string
}

variable "rds_identifier" {
  description = "RDS DB instance identifier."
  type        = string
}

variable "alb_arn_suffix" {
  description = "ALB ARN suffix used in CloudWatch dimensions."
  type        = string
}

variable "tags" {
  description = "Common tags."
  type        = map(string)
  default     = {}
}

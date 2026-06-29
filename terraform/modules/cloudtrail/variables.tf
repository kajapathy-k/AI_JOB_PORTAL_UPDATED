variable "name_prefix" {
  description = "Prefix used for naming."
  type        = string
}

variable "log_retention_days" {
  description = "Retention for CloudTrail CloudWatch Logs."
  type        = number
  default     = 90
}

variable "tags" {
  description = "Common tags."
  type        = map(string)
  default     = {}
}

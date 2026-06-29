variable "name_prefix" {
  description = "Prefix used for naming."
  type        = string
}

variable "table_name" {
  description = "DynamoDB table name."
  type        = string
}

variable "ttl_attribute" {
  description = "TTL attribute name."
  type        = string
  default     = "expires_at"
}

variable "point_in_time_recovery_enabled" {
  description = "Enable point-in-time recovery."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Common tags."
  type        = map(string)
  default     = {}
}

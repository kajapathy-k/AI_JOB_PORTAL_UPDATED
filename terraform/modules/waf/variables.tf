variable "name_prefix" {
  description = "Prefix used for naming."
  type        = string
}

variable "resource_arn" {
  description = "ARN of the regional resource protected by the web ACL."
  type        = string
}

variable "rate_limit" {
  description = "Maximum requests per 5-minute period per IP before blocking."
  type        = number
  default     = 1000
}

variable "tags" {
  description = "Common tags."
  type        = map(string)
  default     = {}
}

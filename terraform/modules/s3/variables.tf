variable "name_prefix" {
  description = "Prefix used for bucket naming."
  type        = string
}

variable "purpose" {
  description = "Short suffix describing the bucket purpose."
  type        = string
}

variable "bucket_name" {
  description = "Optional explicit S3 bucket name."
  type        = string
  default     = null
}

variable "force_destroy" {
  description = "Whether to allow Terraform to destroy non-empty buckets."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common tags."
  type        = map(string)
  default     = {}
}

variable "name_prefix" {
  description = "Prefix used for naming."
  type        = string
}

variable "origin_domain_name" {
  description = "DNS name of the origin behind CloudFront."
  type        = string
}

variable "aliases" {
  description = "Custom CNAME aliases."
  type        = list(string)
  default     = []
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN used by the distribution."
  type        = string
}

variable "price_class" {
  description = "CloudFront price class."
  type        = string
  default     = "PriceClass_100"
}

variable "tags" {
  description = "Common tags."
  type        = map(string)
  default     = {}
}

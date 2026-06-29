variable "name_prefix" {
  description = "Prefix used for naming."
  type        = string
}

variable "vpc_id" {
  description = "VPC identifier."
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs that should receive EFS mount targets."
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security groups allowed to mount EFS over NFS."
  type        = list(string)
}

variable "tags" {
  description = "Common tags."
  type        = map(string)
  default     = {}
}

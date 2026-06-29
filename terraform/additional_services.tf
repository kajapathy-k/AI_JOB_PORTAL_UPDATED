module "documents_bucket" {
  source = "./modules/s3"

  name_prefix   = local.name_prefix
  purpose       = "documents"
  bucket_name   = var.s3_bucket_name
  force_destroy = var.s3_force_destroy
  tags          = local.common_tags
}

module "application_state_table" {
  source = "./modules/dynamodb"

  name_prefix                    = local.name_prefix
  table_name                     = var.dynamodb_table_name != null ? var.dynamodb_table_name : "${local.name_prefix}-interview-sessions"
  ttl_attribute                  = var.dynamodb_ttl_attribute
  point_in_time_recovery_enabled = true
  tags                           = local.common_tags
}

module "shared_filesystem" {
  source = "./modules/efs"

  name_prefix = local.name_prefix
  vpc_id      = module.networking.vpc_id
  subnet_ids  = module.networking.private_app_subnet_ids
  allowed_security_group_ids = [
    module.security_groups.application_security_group_id,
    module.eks.node_security_group_id,
  ]
  tags = local.common_tags
}

module "audit_trail" {
  source = "./modules/cloudtrail"

  name_prefix        = local.name_prefix
  log_retention_days = var.cloudtrail_log_retention_days
  tags               = local.common_tags
}

module "edge_waf" {
  source = "./modules/waf"

  name_prefix  = local.name_prefix
  resource_arn = data.aws_lb.hirevoice_ingress.arn
  rate_limit   = var.waf_rate_limit
  tags         = local.common_tags
}

module "edge_cdn" {
  source = "./modules/cloudfront"

  name_prefix         = local.name_prefix
  origin_domain_name  = data.aws_lb.hirevoice_ingress.dns_name
  aliases             = [local.hirevoice_fqdn]
  acm_certificate_arn = aws_acm_certificate.hirevoice.arn
  price_class         = var.cloudfront_price_class
  tags                = local.common_tags

  depends_on = [
    aws_acm_certificate_validation.hirevoice,
  ]
}

module "operations_dashboard" {
  source = "./modules/cloudwatch"

  name_prefix    = local.name_prefix
  rds_identifier = module.rds.instance_identifier
  alb_arn_suffix = data.aws_lb.hirevoice_ingress.arn_suffix
  tags           = local.common_tags
}

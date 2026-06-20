locals {
  hirevoice_fqdn = "${var.hirevoice_subdomain}.${var.domain_name}"
}

data "aws_lb" "hirevoice_ingress" {
  name = var.hirevoice_alb_name
}

resource "aws_route53_zone" "primary" {
  name    = var.domain_name
  comment = "Public hosted zone for ${var.domain_name}."

  tags = merge(local.common_tags, {
    Name = var.domain_name
  })
}

resource "aws_acm_certificate" "hirevoice" {
  domain_name       = local.hirevoice_fqdn
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(local.common_tags, {
    Name = local.hirevoice_fqdn
  })
}

resource "aws_route53_record" "hirevoice_certificate_validation" {
  for_each = {
    for option in aws_acm_certificate.hirevoice.domain_validation_options :
    option.domain_name => {
      name   = option.resource_record_name
      record = option.resource_record_value
      type   = option.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.primary.zone_id
}

resource "aws_acm_certificate_validation" "hirevoice" {
  certificate_arn = aws_acm_certificate.hirevoice.arn
  validation_record_fqdns = [
    for record in aws_route53_record.hirevoice_certificate_validation : record.fqdn
  ]
}

resource "aws_route53_record" "hirevoice_alias" {
  name    = local.hirevoice_fqdn
  type    = "A"
  zone_id = aws_route53_zone.primary.zone_id

  alias {
    evaluate_target_health = true
    name                   = data.aws_lb.hirevoice_ingress.dns_name
    zone_id                = data.aws_lb.hirevoice_ingress.zone_id
  }
}

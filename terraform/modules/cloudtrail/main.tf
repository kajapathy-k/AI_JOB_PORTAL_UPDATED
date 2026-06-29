data "aws_caller_identity" "current" {}

resource "random_string" "suffix" {
  length  = 6
  lower   = true
  upper   = false
  numeric = true
  special = false
}

locals {
  bucket_name = "${var.name_prefix}-cloudtrail-${random_string.suffix.result}"
}

resource "aws_s3_bucket" "logs" {
  bucket = local.bucket_name

  tags = merge(var.tags, {
    Name    = local.bucket_name
    Service = "cloudtrail"
  })
}

resource "aws_s3_bucket_versioning" "logs" {
  bucket = aws_s3_bucket.logs.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "logs" {
  bucket = aws_s3_bucket.logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_iam_policy_document" "trail_bucket" {
  statement {
    sid       = "AWSCloudTrailAclCheck"
    effect    = "Allow"
    actions   = ["s3:GetBucketAcl"]
    resources = [aws_s3_bucket.logs.arn]

    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
  }

  statement {
    sid       = "AWSCloudTrailWrite"
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.logs.arn}/AWSLogs/${data.aws_caller_identity.current.account_id}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "s3:x-amz-acl"
      values   = ["bucket-owner-full-control"]
    }
  }
}

resource "aws_s3_bucket_policy" "trail_bucket" {
  bucket = aws_s3_bucket.logs.id
  policy = data.aws_iam_policy_document.trail_bucket.json
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/cloudtrail/${var.name_prefix}"
  retention_in_days = var.log_retention_days

  tags = merge(var.tags, {
    Name    = "${var.name_prefix}-cloudtrail-log-group"
    Service = "cloudwatch"
  })
}

data "aws_iam_policy_document" "trail_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "trail_logs" {
  name               = "${var.name_prefix}-cloudtrail-logs-role"
  assume_role_policy = data.aws_iam_policy_document.trail_assume_role.json

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-cloudtrail-logs-role"
  })
}

data "aws_iam_policy_document" "trail_logs" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["${aws_cloudwatch_log_group.this.arn}:*"]
  }
}

resource "aws_iam_role_policy" "trail_logs" {
  name   = "${var.name_prefix}-cloudtrail-logs-policy"
  role   = aws_iam_role.trail_logs.id
  policy = data.aws_iam_policy_document.trail_logs.json
}

resource "aws_cloudtrail" "this" {
  name                          = "${var.name_prefix}-trail"
  s3_bucket_name                = aws_s3_bucket.logs.id
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true
  cloud_watch_logs_group_arn    = "${aws_cloudwatch_log_group.this.arn}:*"
  cloud_watch_logs_role_arn     = aws_iam_role.trail_logs.arn

  event_selector {
    read_write_type           = "All"
    include_management_events = true
  }

  tags = merge(var.tags, {
    Name    = "${var.name_prefix}-trail"
    Service = "cloudtrail"
  })

  depends_on = [
    aws_s3_bucket_policy.trail_bucket,
    aws_iam_role_policy.trail_logs,
  ]
}

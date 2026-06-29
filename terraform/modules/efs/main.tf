resource "aws_security_group" "this" {
  name        = "${var.name_prefix}-efs-sg"
  description = "Allow NFS traffic to ${var.name_prefix} EFS"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name    = "${var.name_prefix}-efs-sg"
    Service = "efs"
  })
}

resource "aws_security_group_rule" "nfs_ingress" {
  for_each = toset(var.allowed_security_group_ids)

  type                     = "ingress"
  from_port                = 2049
  to_port                  = 2049
  protocol                 = "tcp"
  security_group_id        = aws_security_group.this.id
  source_security_group_id = each.value
  description              = "Allow NFS traffic from approved workload security groups"
}

resource "aws_efs_file_system" "this" {
  creation_token = "${var.name_prefix}-efs"
  encrypted      = true

  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }

  tags = merge(var.tags, {
    Name    = "${var.name_prefix}-efs"
    Service = "efs"
  })
}

resource "aws_efs_mount_target" "this" {
  for_each = toset(var.subnet_ids)

  file_system_id  = aws_efs_file_system.this.id
  subnet_id       = each.value
  security_groups = [aws_security_group.this.id]
}

resource "aws_efs_access_point" "this" {
  file_system_id = aws_efs_file_system.this.id

  root_directory {
    path = "/hirevoice"

    creation_info {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = "0755"
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-efs-access-point"
  })
}

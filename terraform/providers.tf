provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

data "aws_eks_cluster" "hirevoice" {
  name = module.eks.cluster_name
}

data "aws_eks_cluster_auth" "hirevoice" {
  name = module.eks.cluster_name
}

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.hirevoice.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.hirevoice.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.hirevoice.token
  }
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.hirevoice.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.hirevoice.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.hirevoice.token
}

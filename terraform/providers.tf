provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ToggleMaster"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Phase       = "Fase3"
    }
  }
}

# Provider Kubernetes/Helm (apontando para o cluster EKS após criado)
data "aws_eks_cluster_auth" "this" {
  name = module.eks.cluster_name
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_ca)
  token                  = data.aws_eks_cluster_auth.this.token
}

provider "helm" {
  kubernetes = {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_ca)
    token                  = data.aws_eks_cluster_auth.this.token
  }
}

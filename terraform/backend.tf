################################################################
# Backend Remoto - tfstate em Bucket S3
# Antes do primeiro `terraform init`, crie manualmente o bucket:
#   aws s3 mb s3://togglemaster-tfstate-<seu-id> --region us-east-1
#   aws s3api put-bucket-versioning \
#       --bucket togglemaster-tfstate-<seu-id> \
#       --versioning-configuration Status=Enabled
################################################################
terraform {
  required_version = ">= 1.6.0"

  backend "s3" {
    bucket       = "togglemaster2-tfstate-fase3"
    key          = "togglemaster/fase3/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true # Lock nativo do S3 (Terraform >= 1.6)
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3.0"
    }
  }
}

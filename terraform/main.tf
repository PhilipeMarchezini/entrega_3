locals {
  name_prefix  = "${var.project_name}-${var.environment}"
  cluster_name = "${local.name_prefix}-eks"
}

module "networking" {
  source       = "./modules/networking"
  name_prefix  = local.name_prefix
  vpc_cidr     = var.vpc_cidr
  azs          = var.azs
  cluster_name = local.cluster_name
}

module "eks" {
  source              = "./modules/eks"
  cluster_name        = local.cluster_name
  cluster_version     = var.eks_cluster_version
  vpc_id              = module.networking.vpc_id
  public_subnet_ids   = module.networking.public_subnet_ids
  private_subnet_ids  = module.networking.private_subnet_ids
  node_instance_types = var.eks_node_instance_types
  node_desired_size   = var.eks_node_desired_size
  lab_role_name       = var.lab_role_name
}

module "rds" {
  source          = "./modules/rds"
  name_prefix     = local.name_prefix
  vpc_id          = module.networking.vpc_id
  vpc_cidr        = module.networking.vpc_cidr
  subnet_ids      = module.networking.private_subnet_ids
  databases       = var.rds_databases
  master_username = var.rds_master_username
  master_password = var.rds_master_password
}

module "elasticache" {
  source      = "./modules/elasticache"
  name_prefix = local.name_prefix
  vpc_id      = module.networking.vpc_id
  vpc_cidr    = module.networking.vpc_cidr
  subnet_ids  = module.networking.private_subnet_ids
}

module "dynamodb" {
  source = "./modules/dynamodb"
}

module "sqs" {
  source      = "./modules/sqs"
  name_prefix = local.name_prefix
}

module "ecr" {
  source = "./modules/ecr"
}

# ArgoCD instalado depois que cluster + nodes estiverem prontos
module "argocd" {
  source     = "./modules/argocd"
  depends_on = [module.eks]
}

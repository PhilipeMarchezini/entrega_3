variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Nome do ambiente (dev, hml, prd)"
  type        = string
  default     = "hml"
}

variable "project_name" {
  description = "Prefixo para nomes de recursos"
  type        = string
  default     = "togglemaster"
}

variable "vpc_cidr" {
  description = "CIDR da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability Zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# AWS Academy: LabRole pre-existente (não criamos roles via Terraform).
variable "lab_role_name" {
  description = "Nome da role do AWS Academy (Sandbox)"
  type        = string
  default     = "LabRole"
}

variable "eks_cluster_version" {
  description = "Versão do Kubernetes no EKS"
  type        = string
  default     = "1.30"
}

variable "eks_node_instance_types" {
  description = "Tipos de instância dos nós (use t3.medium para economizar no Academy)"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "eks_node_desired_size" {
  description = "Quantidade desejada de nós"
  type        = number
  default     = 2
}

variable "rds_master_username" {
  description = "Usuário master dos bancos RDS"
  type        = string
  default     = "togglemaster"
}

variable "rds_master_password" {
  description = "Senha master (use TF_VAR_rds_master_password)"
  type        = string
  sensitive   = true
}

variable "rds_databases" {
  description = "Lista de bancos RDS (um por microsserviço que usa Postgres)"
  type        = list(string)
  default     = ["auth", "flag", "targeting"]
}

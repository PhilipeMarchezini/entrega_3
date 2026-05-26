output "vpc_id" {
  value = module.networking.vpc_id
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value     = module.eks.cluster_endpoint
  sensitive = true
}

output "rds_endpoints" {
  value     = module.rds.endpoints
  sensitive = true
}

output "redis_endpoint" {
  value     = module.elasticache.redis_endpoint
  sensitive = true
}

output "dynamodb_table" {
  value = module.dynamodb.table_name
}

output "sqs_queue_url" {
  value = module.sqs.queue_url
}

output "ecr_repositories" {
  value = module.ecr.repository_urls
}

output "kubeconfig_command" {
  description = "Comando para configurar o kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

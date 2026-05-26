################################################################
# ElastiCache Redis (cluster simples para o evaluation-service)
################################################################

resource "aws_elasticache_subnet_group" "this" {
  name       = "${var.name_prefix}-redis-subnets"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "redis" {
  name        = "${var.name_prefix}-redis-sg"
  description = "Allow Redis from VPC"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "Redis da VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_elasticache_cluster" "this" {
  cluster_id           = "${var.name_prefix}-redis"
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.this.name
  security_group_ids   = [aws_security_group.redis.id]

  tags = { Name = "${var.name_prefix}-redis" }
}

################################################################
# EKS Cluster + Node Group usando LabRole (AWS Academy)
# IMPORTANTE (Opção A do enunciado): NÃO criamos IAM roles/policies.
# Importamos a LabRole via data source e a anexamos ao cluster e nodes.
################################################################

data "aws_iam_role" "lab_role" {
  name = var.lab_role_name
}

# Security Group do cluster (SG não é IAM; pode ser criado)
resource "aws_security_group" "cluster" {
  name        = "${var.cluster_name}-cluster-sg"
  description = "EKS cluster control plane SG"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_eks_cluster" "this" {
  name     = var.cluster_name
  version  = var.cluster_version
  role_arn = data.aws_iam_role.lab_role.arn # LabRole

  vpc_config {
    subnet_ids              = concat(var.public_subnet_ids, var.private_subnet_ids)
    endpoint_public_access  = true
    endpoint_private_access = true
    security_group_ids      = [aws_security_group.cluster.id]
  }

  # Garante que o cluster fique pronto antes dos node groups
  tags = { Name = var.cluster_name }
}

resource "aws_eks_node_group" "default" {
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "${var.cluster_name}-ng"
  node_role_arn   = data.aws_iam_role.lab_role.arn # LabRole também nos nodes
  subnet_ids      = var.public_subnet_ids          # public p/ evitar NAT Gateway no Academy
  instance_types  = var.node_instance_types

  scaling_config {
    desired_size = var.node_desired_size
    min_size     = 1
    max_size     = 3
  }

  update_config {
    max_unavailable = 1
  }

  tags = { Name = "${var.cluster_name}-ng" }

  depends_on = [aws_eks_cluster.this]
}

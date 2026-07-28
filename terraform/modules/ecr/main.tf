resource "aws_ecr_repository" "this" {
  for_each = toset(var.services)

  name                 = "togglemaster/${each.value}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true # permite `terraform destroy` mesmo com imagens no repo

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = { Service = each.value }
}

resource "aws_ecr_lifecycle_policy" "this" {
  for_each   = aws_ecr_repository.this
  repository = each.value.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Manter apenas as 10 imagens mais recentes"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

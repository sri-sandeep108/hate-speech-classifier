# ---------------------------------------------------------------------------------------------------------------------
# ECR REPOSITORIES (BACKEND & FRONTEND)
# ---------------------------------------------------------------------------------------------------------------------

locals {
  ecr_repositories = {
    backend  = "hate-speech-backend"
    frontend = "hate-speech-frontend"
  }
}

resource "aws_ecr_repository" "repos" {
  for_each             = local.ecr_repositories
  name                 = each.value
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = each.value
  }
}

# ---------------------------------------------------------------------------------------------------------------------
# ECR LIFECYCLE POLICY (AUTOMATIC IMAGE CLEANUP)
# ---------------------------------------------------------------------------------------------------------------------

resource "aws_ecr_lifecycle_policy" "repos" {
  for_each   = aws_ecr_repository.repos
  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire untagged images older than 1 day"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Retain only the last 10 tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v", "build", "latest", "sha"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

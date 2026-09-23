locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# --- VPC por defecto (simplifica el MVP; ver riesgo de seguridad en ADR-0004) ---
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# --- S3 (fotos de animales) ---
resource "aws_s3_bucket" "fotos" {
  bucket = "${local.name_prefix}-fotos-animales"
}

resource "aws_s3_bucket_public_access_block" "fotos" {
  bucket                  = aws_s3_bucket.fotos.id
  block_public_acls       = true
  block_public_policy     = false # necesitamos una policy acotada de lectura pública
  ignore_public_acls      = true
  restrict_public_buckets = false
}

# Lectura pública solo de los objetos (no de la configuración del bucket)
resource "aws_s3_bucket_policy" "fotos_lectura_publica" {
  bucket = aws_s3_bucket.fotos.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.fotos.arn}/*"
    }]
  })
  depends_on = [aws_s3_bucket_public_access_block.fotos]
}

# --- Security Groups ---
resource "aws_security_group" "rds" {
  name        = "${local.name_prefix}-rds-sg"
  description = "Permite acceso a PostgreSQL desde Elastic Beanstalk y, temporalmente, para administracion"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "PostgreSQL"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    # MVP: abierto a nivel de VPC por defecto. Ver riesgo señalado en ADR-0004 —
    # restringir al security group de Beanstalk antes de una demo pública prolongada.
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }
}

# --- RDS PostgreSQL ---
resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids
}

resource "aws_db_instance" "main" {
  identifier             = "${local.name_prefix}-db"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = var.db_instance_class
  allocated_storage      = 20 # dentro del free tier
  db_name                = var.project_name
  username                = var.db_username
  password                = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = true # MVP — ver riesgo en ADR-0004
  skip_final_snapshot    = true
  multi_az                = false # bajo costo, sin alta disponibilidad (aceptado en RNF2)
}

# --- SSM Parameter Store (secretos) ---
resource "aws_ssm_parameter" "db_password" {
  name  = "/${local.name_prefix}/db_password"
  type  = "SecureString"
  value = var.db_password

  lifecycle {
    ignore_changes = [value] # el valor real se rota a mano con aws ssm put-parameter, no acá
  }
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${local.name_prefix}/jwt_secret"
  type  = "SecureString"
  value = "changeme-generar-un-secreto-fuerte" # solo usado en la creación inicial

  lifecycle {
    ignore_changes = [value] # el valor real se rota a mano con aws ssm put-parameter, no acá
  }
}

resource "aws_ssm_parameter" "staff_password_hash" {
  name  = "/${local.name_prefix}/staff_password_hash"
  type  = "SecureString"
  value = "changeme-generar-hash-bcrypt" # solo usado en la creación inicial

  lifecycle {
    ignore_changes = [value] # el valor real se rota a mano con aws ssm put-parameter, no acá
  }
}

# --- IAM Role para las instancias de Elastic Beanstalk ---
resource "aws_iam_role" "eb_instance_role" {
  name = "${local.name_prefix}-eb-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eb_web_tier" {
  role       = aws_iam_role.eb_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy" "eb_ssm_read" {
  name = "${local.name_prefix}-eb-ssm-read"
  role = aws_iam_role.eb_instance_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameter", "ssm:GetParameters"]
      Resource = "arn:aws:ssm:${var.aws_region}:*:parameter/${local.name_prefix}/*"
    }]
  })
}

resource "aws_iam_role_policy" "eb_s3_access" {
  name = "${local.name_prefix}-eb-s3-access"
  role = aws_iam_role.eb_instance_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:PutObject", "s3:GetObject", "s3:ListBucket"]
      Resource = [aws_s3_bucket.fotos.arn, "${aws_s3_bucket.fotos.arn}/*"]
    }]
  })
}

resource "aws_iam_instance_profile" "eb" {
  name = "${local.name_prefix}-eb-instance-profile"
  role = aws_iam_role.eb_instance_role.name
}

# --- Frontend estático (S3 privado + CloudFront) ---
resource "aws_s3_bucket" "frontend" {
  bucket = "${local.name_prefix}-web"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${local.name_prefix}-web-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFrontRead"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.frontend.arn}/*"
      Condition = {
        StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.main.arn }
      }
    }]
  })
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # solo edge locations de US/Europa — más barato, suficiente para una demo

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "s3-frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  origin {
    domain_name = aws_elastic_beanstalk_environment.api.cname
    origin_id   = "eb-api"
    custom_origin_config {
      http_port              = 80
      https_port              = 443
      origin_protocol_policy  = "http-only" # Beanstalk (instancia única) solo escucha HTTP — ver ADR-0001
      origin_ssl_protocols    = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods         = ["GET", "HEAD"]
    cached_methods           = ["GET", "HEAD"]
    cache_policy_id          = "658327ea-f89d-4fab-a63d-7e88639e58f6" # AWS managed: CachingOptimized
  }

  ordered_cache_behavior {
    path_pattern             = "/api/*"
    target_origin_id         = "eb-api"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods           = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods             = ["GET", "HEAD"]
    cache_policy_id            = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # AWS managed: CachingDisabled
    origin_request_policy_id   = "216adef6-5c7f-47e4-b989-5492eafa07d3" # AWS managed: AllViewer (reenvía headers, incluido Authorization)
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true # HTTPS gratis en *.cloudfront.net, sin ACM ni dominio propio
  }
}

# --- CI/CD: GitHub Actions vía OIDC (sin credenciales de larga duración) ---
# El OIDC provider es un recurso por cuenta de AWS, no por proyecto — ya existe
# (creado para Shem72). Lo referenciamos de solo lectura, sin gestionarlo acá,
# para no arriesgar que un destroy de Refugia se lleve puesto un recurso compartido.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_role" "github_actions" {
  name = "${local.name_prefix}-github-actions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = data.aws_iam_openid_connect_provider.github.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = { "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com" }
        # Acotado a pushes a main del repo refugia — ni otros repos ni otras ramas pueden asumir este rol
        StringLike = { "token.actions.githubusercontent.com:sub" = "repo:EmmaLedesma/refugia:ref:refs/heads/main" }
      }
    }]
  })
}

resource "aws_iam_role_policy" "github_actions_deploy" {
  name = "${local.name_prefix}-github-actions-deploy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "S3DeployArtifacts"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetObject"]
        Resource = "${aws_s3_bucket.fotos.arn}/deploys/*"
      },
      {
        Sid      = "S3FrontendSync"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
        Resource = [aws_s3_bucket.frontend.arn, "${aws_s3_bucket.frontend.arn}/*"]
      },
      {
        Sid    = "ElasticBeanstalkDeploy"
        Effect = "Allow"
        Action = [
          "elasticbeanstalk:CreateApplicationVersion", "elasticbeanstalk:UpdateEnvironment",
          "elasticbeanstalk:DescribeEnvironments", "elasticbeanstalk:DescribeApplicationVersions",
          "elasticbeanstalk:DescribeEvents",
        ]
        Resource = "*"
      },
      {
        Sid      = "CloudFrontInvalidate"
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation"]
        Resource = aws_cloudfront_distribution.main.arn
      },
    ]
  })
}

# --- Elastic Beanstalk (API) — ver docs/adr/0001-hosting-api.md ---
resource "aws_elastic_beanstalk_application" "api" {
  name        = local.name_prefix
  description = "Refugia API — MVP"
}

resource "aws_elastic_beanstalk_environment" "api" {
  name                = "${local.name_prefix}-env"
  application         = aws_elastic_beanstalk_application.api.name
  solution_stack_name = "64bit Amazon Linux 2023 v6.11.8 running Node.js 22"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb.name
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance" # sin load balancer — bajo costo, ver ADR-0004
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_HOST"
    value     = aws_db_instance.main.address
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_NAME"
    value     = aws_db_instance.main.db_name
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_USER"
    value     = var.db_username
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AWS_S3_BUCKET"
    value     = aws_s3_bucket.fotos.bucket
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AWS_REGION"
    value     = var.aws_region
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = "production"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "STAFF_USERNAME"
    value     = var.staff_username
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PROJECT_NAME"
    value     = local.name_prefix
  }

  # DB_PASSWORD y JWT_SECRET se leen desde SSM Parameter Store en runtime
  # (server.js los busca vía AWS SDK), no se exponen acá en texto plano.
}

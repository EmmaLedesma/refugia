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
  description = "Permite acceso a PostgreSQL desde Elastic Beanstalk y, temporalmente, para administración"
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
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${local.name_prefix}/jwt_secret"
  type  = "SecureString"
  value = "changeme-generar-un-secreto-fuerte" # reemplazar manualmente tras el primer apply
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

  # DB_PASSWORD y JWT_SECRET se leen desde SSM Parameter Store en runtime
  # (server.js los busca vía AWS SDK), no se exponen acá en texto plano.
}

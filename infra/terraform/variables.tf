variable "project_name" {
  description = "Nombre base del proyecto, usado como prefijo de los recursos"
  type        = string
  default     = "refugia"
}

variable "environment" {
  description = "Entorno de despliegue (dev, demo)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "sa-east-1" # São Paulo — la más cercana a Argentina disponible en AWS
}

variable "db_username" {
  description = "Usuario administrador de RDS"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Password del administrador de RDS"
  type        = string
  sensitive   = true
}

variable "instance_type" {
  description = "Tipo de instancia EC2 para Elastic Beanstalk (free tier: t3.micro)"
  type        = string
  default     = "t3.micro"
}

variable "db_instance_class" {
  description = "Clase de instancia RDS (free tier: db.t3.micro)"
  type        = string
  default     = "db.t3.micro"
}

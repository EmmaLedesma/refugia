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

variable "location" {
  description = "Región de Azure"
  type        = string
  default     = "brazilsouth" # región más cercana a Argentina disponible en Azure
}

variable "sql_admin_login" {
  description = "Usuario administrador de Azure SQL"
  type        = string
  sensitive   = true
}

variable "sql_admin_password" {
  description = "Password del administrador de Azure SQL"
  type        = string
  sensitive   = true
}

variable "app_service_sku" {
  description = "SKU del App Service Plan (tier bajo/free para portfolio, ver docs/adr)"
  type        = string
  default     = "B1" # Basic — el tier Free (F1) no soporta algunas features que puede necesitar la app
}

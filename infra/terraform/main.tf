locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# --- Resource Group ---
resource "azurerm_resource_group" "main" {
  name     = "${local.name_prefix}-rg"
  location = var.location
}

# --- Azure SQL (server + database) ---
resource "azurerm_mssql_server" "main" {
  name                         = "${local.name_prefix}-sql"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_login
  administrator_login_password = var.sql_admin_password
  minimum_tls_version          = "1.2"
}

resource "azurerm_mssql_database" "main" {
  name         = var.project_name
  server_id    = azurerm_mssql_server.main.id
  sku_name     = "Basic" # suficiente para MVP/portfolio, bajo costo
  max_size_gb  = 2
}

# Permite acceso desde servicios de Azure (App Service) a la base
resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# --- Storage (fotos de animales) ---
resource "azurerm_storage_account" "main" {
  name                     = replace("${local.name_prefix}sa", "-", "") # sin guiones, límite de Azure
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS" # menor costo; suficiente para MVP/portfolio
}

resource "azurerm_storage_container" "fotos" {
  name                  = "fotos-animales"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob" # lectura pública de fotos, sin exponer el resto de la cuenta
}

# --- Key Vault (secrets) ---
data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "main" {
  name                = "${local.name_prefix}-kv"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"
}

resource "azurerm_key_vault_access_policy" "app_service" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_web_app.api.identity[0].principal_id

  secret_permissions = ["Get", "List"]
}

# --- Application Insights (observabilidad) ---
resource "azurerm_application_insights" "main" {
  name                = "${local.name_prefix}-appinsights"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  application_type    = "Node.JS"
}

# --- App Service (API) — ver docs/adr/0001-hosting-api.md ---
resource "azurerm_service_plan" "main" {
  name                = "${local.name_prefix}-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_sku
}

resource "azurerm_linux_web_app" "api" {
  name                = "${local.name_prefix}-api"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  identity {
    type = "SystemAssigned" # permite acceder a Key Vault sin credenciales embebidas
  }

  site_config {
    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main.connection_string
    "DB_HOST"                               = azurerm_mssql_server.main.fully_qualified_domain_name
    "DB_NAME"                               = azurerm_mssql_database.main.name
    "AZURE_STORAGE_CONTAINER"               = azurerm_storage_container.fotos.name
    "NODE_ENV"                              = "production"
    # DB_USER, DB_PASSWORD, JWT_SECRET, AZURE_STORAGE_CONNECTION_STRING:
    # se configuran como secretos en Key Vault, no en texto plano aquí.
  }
}

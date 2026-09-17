output "api_url" {
  description = "URL pública de la API"
  value       = "https://${azurerm_linux_web_app.api.default_hostname}"
}

output "sql_server_fqdn" {
  description = "FQDN del servidor Azure SQL"
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "storage_account_name" {
  description = "Nombre de la storage account (fotos)"
  value       = azurerm_storage_account.main.name
}

output "key_vault_uri" {
  description = "URI del Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

output "application_insights_instrumentation_key" {
  description = "Instrumentation key de Application Insights"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

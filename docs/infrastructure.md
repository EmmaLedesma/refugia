# Infraestructura — Refugia MVP (Azure)

Provisionada íntegramente con Terraform (`infra/terraform/`). Ver [ADR-0004](adr/0004-costos-infraestructura.md) para la justificación de tiers.

## Recursos

| Recurso | Azure Service | Propósito |
|---|---|---|
| Resource Group | `azurerm_resource_group` | Agrupa todo el proyecto |
| API | `azurerm_linux_web_app` (App Service, Linux, Node 20) | Hosting de la API — ver [ADR-0001](adr/0001-hosting-api.md) |
| Base de datos | `azurerm_mssql_server` + `azurerm_mssql_database` (tier Basic) | Modelo relacional — ver [docs/data-model.md](data-model.md) |
| Fotos | `azurerm_storage_account` + `azurerm_storage_container` | Galería de fotos de animales (RF10) |
| Secretos | `azurerm_key_vault` | Credenciales de DB, JWT secret, connection string de Storage |
| Observabilidad | `azurerm_application_insights` | Logs y métricas — RNF3 |

## Cómo se conectan los secretos

La API usa **Managed Identity** (`SystemAssigned`) del App Service para leer del Key Vault — no hay credenciales embebidas en `app_settings` ni en el código. Los valores no sensibles (host de DB, nombre de contenedor) sí van directo en `app_settings` porque no son secretos.

## Cómo desplegar

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # completar con credenciales reales
terraform init
terraform plan
terraform apply
```

`terraform.tfvars` está en `.gitignore` — nunca se commitea con credenciales reales.

## Costos (estimado, no verificado con calculadora oficial)

Diseñado para mantenerse en tiers bajos: App Service Plan B1, Azure SQL Basic, Storage LRS. Esto es una estimación de diseño, no una cotización — antes de dejarlo corriendo períodos largos, correr la [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/) con la región y tiers reales.

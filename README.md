# Refugia

Plataforma de gestión operativa para organizaciones rescatistas de animales en CABA — la capa de back-office que la plataforma estatal "Animales BA" no cubre.

> Proyecto académico (materia *Administración de Negocios Digitales*) y proyecto de portfolio técnico. El MVP prioriza demostrar criterio de **Solution Architecture** sobre un problema real, no cobertura funcional completa.

## Estado del proyecto

MVP en desarrollo. Alcance: **un solo refugio** (sin multi-tenant), foco en gestión de animales + adopción responsable.

## Problema

Las organizaciones rescatistas en CABA gestionan animales, historias clínicas, tránsitos y donaciones mediante WhatsApp y planillas. La Ley 6856 (CABA) exige una plataforma de bienestar animal; la respuesta estatal ("Animales BA") cubre al ciudadano pero no da herramientas de operación a los refugios.

*Nota: el marco legal e institucional (Ley 6856, Animales BA) proviene del material de la materia y se trata como premisa de trabajo, no como dato verificado externamente.*

## Propuesta de valor

Refugia le da a un refugio una ficha única del animal, su historia clínica estructurada, y un proceso de adopción responsable basado en scoring de compatibilidad — sin depender de WhatsApp/Excel.

## Alcance del MVP

**Incluido:**
- Gestión de animales (ficha, galería de fotos, historia clínica por tipo de evento: vacuna / cirugía / tratamiento)
- Adopción responsable (cuestionario de adoptante, scoring de compatibilidad, postulaciones)

**Fuera de alcance (roadmap):**
- Red de hogares de tránsito
- Módulo de padrinos y donaciones
- Multi-refugio / multi-tenant
- Matching por Machine Learning (Fase 2 — ver [docs/roadmap.md](docs/roadmap.md))

## Arquitectura (resumen)

| Componente | Tecnología | Por qué |
|---|---|---|
| API | Node.js / Express | Ver [ADR-0001](docs/adr/0001-hosting-api.md) |
| Base de datos | Azure SQL Database | Modelo 100% relacional (ver modelo de datos) |
| Fotos | Azure Blob Storage | Binarios fuera de la base, patrón estándar |
| Hosting | Azure App Service | Ver [ADR-0001](docs/adr/0001-hosting-api.md) |
| Auth | JWT propio | Ver [ADR-0002](docs/adr/0002-auth.md) |
| Observabilidad | Application Insights | Bajo costo, integración nativa con App Service |
| Secrets | Azure Key Vault | Connection strings y claves fuera del código |
| IaC | Terraform | Infraestructura versionada y reproducible |
| CI/CD | GitHub Actions | Build + deploy automatizado |

Detalle completo en [docs/architecture.md](docs/architecture.md) (pendiente de completar en la próxima etapa).

## Documentación

- [Requisitos funcionales y no funcionales](docs/requirements.md)
- [Modelo de datos](docs/data-model.md)
- [ADRs](docs/adr/)
- [Roadmap / fuera de alcance](docs/roadmap.md)

## Disclaimer de portfolio

Este proyecto es una demo técnica y académica. No representa disponibilidad de nivel productivo ni fue validado con un refugio real en producción — foco razonamiento de Solution Architecture sobre un problema de negocio concreto.

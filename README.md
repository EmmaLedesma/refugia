# Refugia

Plataforma de gestión operativa para organizaciones rescatistas de animales en CABA — la capa de back-office que la plataforma estatal "Animales BA" no cubre.

> Proyecto académico (materia *Administración de Negocios Digitales*) y proyecto de portfolio técnico. El MVP prioriza demostrar criterio de **Solution Architecture** sobre un problema real, no cobertura funcional completa.

## Estado del proyecto

MVP en desarrollo. Alcance: **un solo refugio** (sin multi-tenant), foco en gestión de animales + adopción responsable.

API: scaffolding inicial en `api/` (Node/Express + Sequelize sobre AWS RDS PostgreSQL). Implementado hasta ahora: modelos completos del dominio, endpoints de `animales` (RF1, RF3, RF4, RF9) y servicio de scoring de matching (RF6, versión por reglas). Pendiente: endpoints de adoptantes/postulaciones, autenticación funcional end-to-end.

Infraestructura: definida como código en `infra/terraform/` (Elastic Beanstalk, RDS PostgreSQL, S3, SSM Parameter Store, IAM). Migrada de Azure a AWS — ver [ADR-0005](docs/adr/0005-migracion-azure-a-aws.md). Pendiente: primer `terraform apply` real y despliegue de la API.

### Correr la API localmente
```bash
cd api
cp .env.example .env   # completar credenciales de Azure SQL y JWT_SECRET
npm install
npm run dev
```

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
| API | Node.js / Express | Ver [ADR-0005](docs/adr/0005-migracion-azure-a-aws.md) |
| Base de datos | AWS RDS (PostgreSQL) | Modelo 100% relacional (ver modelo de datos) |
| Fotos | AWS S3 | Binarios fuera de la base, patrón estándar |
| Hosting | AWS Elastic Beanstalk (instancia única) | Ver [ADR-0005](docs/adr/0005-migracion-azure-a-aws.md) |
| Auth | JWT propio | Ver [ADR-0005](docs/adr/0005-migracion-azure-a-aws.md) |
| Observabilidad | CloudWatch | Integración nativa con Elastic Beanstalk |
| Secrets | AWS SSM Parameter Store | Connection strings y claves fuera del código |
| IaC | Terraform | Infraestructura versionada y reproducible |
| CI/CD | GitHub Actions | Build + deploy automatizado |

Detalle completo en [docs/architecture.md](docs/architecture.md) (pendiente de completar en la próxima etapa).

## Documentación

- [Requisitos funcionales y no funcionales](docs/requirements.md)
- [Modelo de datos](docs/data-model.md)
- [Infraestructura (Terraform)](docs/infrastructure.md)
- [ADRs](docs/adr/) — [ADR-0005 migración a AWS](docs/adr/0005-migracion-azure-a-aws.md) (vigente), [ADR-0003 modelo de eventos clínicos y ORM](docs/adr/0003-modelo-eventos-clinicos-orm.md) (vigente); 0001, 0002 y 0004 quedan como registro histórico de la decisión original en Azure
- [Roadmap / fuera de alcance](docs/roadmap.md)

## Disclaimer de portfolio

Este proyecto es una demo técnica y académica. No representa disponibilidad de nivel productivo ni fue validado con un refugio real en producción — el foco es mostrar razonamiento de Solution Architecture sobre un problema de negocio concreto.

# 🐾 Refugia

**Plataforma de gestión operativa para refugios de animales en CABA — la capa de back-office que la plataforma estatal "Animales BA" no cubre**

[![AWS](https://img.shields.io/badge/AWS-Elastic_Beanstalk-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com)
[![Terraform](https://img.shields.io/badge/Terraform-1.5+-7B42BC?style=flat-square&logo=terraform&logoColor=white)](https://terraform.io)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Status](https://img.shields.io/badge/status-completo_y_cerrado-success?style=flat-square)](#-cierre-del-proyecto)
[![FinOps](https://img.shields.io/badge/FinOps-zero--spend_budget-blue?style=flat-square)](#-cierre-del-proyecto)

🔗 [LinkedIn](https://www.linkedin.com/in/emmanuel-ledesmam) · [GitHub](https://github.com/EmmaLedesma)

---

## 📌 Concepto

Un rescatista de un refugio puede fichar un animal, registrar su historia clínica por tipo de evento, subir fotos, y encontrar candidatos de adopción compatibles según un score calculado — sin depender de WhatsApp y planillas de Excel.

Proyecto académico (materia *Administración de Negocios Digitales*, Licenciatura en Tecnologías Digitales — Universidad de la Ciudad de Buenos Aires) y proyecto de portfolio técnico. El foco no es cobertura funcional completa, sino demostrar **criterio de Solution Architecture** sobre un problema de negocio real: cada decisión de arquitectura está documentada como ADR, con alternativas consideradas y trade-offs explícitos — incluidos los errores y lo que costaron.

---

## 🏁 Estado: proyecto completo y cerrado

**Refugia se desarrolló hasta el final del alcance planteado y se dio por cerrado.** Llegó a estar desplegado y funcionando de punta a punta en AWS (infraestructura como código, CI/CD, HTTPS, frontend, API, base de datos y fotos), y todo lo que figura abajo fue efectivamente probado en producción real mientras estuvo arriba.

**La infraestructura en AWS fue dada de baja por una cuestión de costos**, no técnica: una facturación inesperada mostró que el diseño no tenía controles de gasto activos (ver [Cierre del proyecto](#-cierre-del-proyecto) y [ADR-0008](docs/adr/0008-pausa-por-costos-rediseno-free-tier.md)). Se decidió cerrar el proyecto en este punto en lugar de sostener recursos que no entran en el Free Tier. El código, la infraestructura como código (Terraform), los pipelines y la documentación quedan publicados como evidencia técnica, y **todo se puede correr en local sin AWS y sin costo** → [docs/local-development.md](docs/local-development.md).

| Componente | Estado |
|---|---|
| Infraestructura AWS (Terraform) | ✅ Implementada y desplegada en su momento · 🔴 dada de baja al cierre (costos) |
| Correr en local (sin AWS) | ✅ Guía completa en [docs/local-development.md](docs/local-development.md) |
| Base de datos | ✅ 8 tablas, migraciones versionadas (`sequelize-cli`) |
| API (animales, adoptantes, postulaciones, auth, historia clínica, fotos) | ✅ Probada end-to-end en producción real mientras estuvo desplegada |
| Frontend (`web/`) | ✅ Home, ficha con historia clínica y galería, postulación, panel del staff |
| Fotos | ✅ Upload real vía URLs presignadas de S3 — [ADR-0007](docs/adr/0007-upload-fotos-s3-presigned.md) (solo disponible contra AWS) |
| HTTPS + hosting del frontend | ✅ CloudFront (S3 + API bajo `/api`) — [ADR-0005](docs/adr/0005-https-y-hosting-frontend.md) |
| CI/CD | ✅ GitHub Actions vía OIDC, sin credenciales guardadas — [ADR-0006](docs/adr/0006-cicd-github-actions.md) · workflows deshabilitados al cierre (ya no existe la infraestructura destino) |
| Hardening de seguridad | ✅ RDS restringido al security group real de Beanstalk · usuario de deploy sin `AdministratorAccess` |
| Control de costos (FinOps) | ✅ Zero-Spend Budget configurado en AWS tras el incidente — ver [Cierre](#-cierre-del-proyecto) |

> **Cómo ver el proyecto hoy:** como la demo pública está apagada, la forma de recorrerlo es clonar el repo y seguir [docs/local-development.md](docs/local-development.md) (Docker + Node, ~10 minutos, costo cero), o leer los [ADRs](docs/adr/) para ver cómo se tomó cada decisión.

---

## 🏗️ Arquitectura (tal como estuvo desplegada)

```
┌─────────────────────────────────────────────────────────────┐
│              Frontend (S3 + CloudFront) / local             │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS (AWS) / HTTP (local)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│         AWS Elastic Beanstalk (instancia única)                 │
│              Node.js 22 + Express — API REST                    │
│                                                                 │
│  Rutas → Controllers → Services (matching) → Modelos (Sequelize)
└──────────┬──────────────────────────┬───────────────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────┐      ┌───────────────────────┐
│   AWS RDS /      │      │       AWS S3          │
│   Postgres local │      │  fotos-animales       │
│  (8 tablas,      │      │  (solo en AWS)        │
│   migraciones    │      └───────────────────────┘
│   versionadas)   │
└──────────────────┘
           ▲
           │ credenciales (SSM en AWS, .env en local)
┌──────────────────────────────────────────────────┐
│         AWS SSM Parameter Store                  │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Recursos AWS definidos (Terraform)

| Recurso | Nombre | Definido en |
|---|---|---|
| Elastic Beanstalk App + Env | `refugia-dev` / `refugia-dev-env` | `infra/terraform/main.tf` |
| RDS PostgreSQL | `refugia-dev-db` (db.t3.micro) | `infra/terraform/main.tf` |
| S3 Buckets | fotos + frontend | `infra/terraform/main.tf` |
| CloudFront | HTTPS + hosting del frontend | `infra/terraform/main.tf` |
| Security Groups | RDS (restringido al SG real de Beanstalk) | `infra/terraform/main.tf` |
| SSM Parameters (SecureString) | `/refugia-dev/*` | `infra/terraform/main.tf` |
| IAM Roles | instancia de Beanstalk, GitHub Actions (OIDC), usuario de deploy acotado | `infra/terraform/main.tf` |
| GitHub Actions OIDC | CI/CD sin credenciales guardadas | `infra/terraform/main.tf`, `.github/workflows/` |

---

## ✅ Features implementadas

- Modelo de datos completo (Animal, Foto, EventoClinico + Vacuna/Cirugía/Tratamiento normalizados, Adoptante, Postulación)
- Migraciones versionadas y seeder con datos ricos (scores reales de matching, no inventados)
- Historia clínica completa: alta y consulta de eventos clínicos, UI en la ficha del animal
- Matching de adopción por reglas ponderadas con score 0–100 explicable, validado con casos de score alto/medio/bajo (de 100 a 10)
- Fotos con upload real vía S3 presignado (el navegador sube directo a S3)
- Login + panel de staff, gestión de animales/adoptantes/postulaciones con aceptar/rechazar
- Frontend de 4 páginas, estética inspirada en Animales BA con identidad propia
- Infraestructura 100% como código (Terraform) y CI/CD con GitHub Actions vía OIDC
- Hardening de seguridad aplicado y verificado

## 🔭 Ideas de evolución (fuera de alcance — el proyecto está cerrado)

- Rediseño serverless (Lambda + API Gateway) con infraestructura *on-demand* (`apply` solo para una demo, `destroy` después) — la evolución natural para costo cercano a cero
- Matching por Machine Learning (necesita historial real de adopciones; el modelo de datos ya está pensado para eso — ver [roadmap](docs/roadmap.md))
- Red de hogares de tránsito, módulo de padrinos/donaciones, multi-refugio

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| API | Node.js 22 + Express |
| ORM | Sequelize (dialecto `postgres`) |
| Base de datos | PostgreSQL (RDS en AWS / Docker en local) |
| Storage de fotos | AWS S3 |
| Hosting | AWS Elastic Beanstalk (instancia única) + CloudFront |
| Secretos | AWS SSM Parameter Store (AWS) / `.env` (local) |
| Auth | JWT propio |
| IaC | Terraform |
| CI/CD | GitHub Actions, OIDC (sin credenciales guardadas) |

---

## 🔐 Seguridad

- Secretos nunca en el repo (`.env`, `terraform.tfvars` en `.gitignore`; SSM Parameter Store en AWS)
- RDS restringido al security group real de Beanstalk (no abierto a toda la VPC)
- Usuario de deploy (`refugia-deploy`) sin `AdministratorAccess` — policies de AWS por servicio + policy propia acotada por nombre de recurso para IAM/SSM
- CI/CD sin credenciales de larga duración (OIDC, con trust acotado al repo y a la rama `main`)

---

## 📁 Estructura del proyecto

```
refugia/
├── README.md
├── docs/
│   ├── requirements.md, data-model.md, roadmap.md, infrastructure.md
│   ├── local-development.md   # correr todo sin AWS
│   └── adr/            # 8 ADRs: decisiones con trade-offs (incluye errores y su costo)
├── .github/workflows/   # CI/CD — deploy-api.yml, deploy-frontend.yml
├── infra/terraform/     # Toda la infraestructura AWS como código
├── web/                 # Frontend — HTML/CSS/JS plano, sin build tooling
│   ├── index.html        # home pública
│   ├── ficha.html         # ficha del animal — historia clínica, fotos, adopción
│   ├── postular.html      # cuestionario de adoptante + postulación
│   ├── staff.html         # login + panel
│   └── assets/style.css   # estética inspirada en Animales BA
└── api/
    ├── .sequelizerc
    └── src/
        ├── config/       # conexión DB, secretos (SSM o .env), S3
        ├── models/        # Sequelize — 8 entidades
        ├── migrations/    # 8 migraciones versionadas
        ├── seeders/       # datos de demo
        ├── controllers/, routes/   # animales, adoptantes, postulaciones, auth
        ├── services/      # matchingService (scoring)
        └── middleware/    # auth (JWT), errorHandler
```

---

## ⚡ Quick Start

**Local, sin AWS, costo cero** → [docs/local-development.md](docs/local-development.md)

---

## 🧭 Decisiones técnicas

**¿Por qué Elastic Beanstalk y no Lambda?**
Latencia consistente para una demo en vivo, sin cold starts. Ver [ADR-0001](docs/adr/0001-hosting-api.md). (Con la lección de costos, Lambda + infraestructura on-demand es la evolución natural — ver *Ideas de evolución*.)

**¿Por qué PostgreSQL normalizado y no una colección NoSQL para la historia clínica?**
Con solo 3 tipos de evento clínico fijos (vacuna, cirugía, tratamiento), la normalización es simple y se explica con un diagrama ER convencional. Ver [ADR-0003](docs/adr/0003-modelo-eventos-clinicos-orm.md).

**¿Por qué scoring por reglas y no Machine Learning?**
Un modelo de ML necesita historial real de adopciones para aprender algo útil — no existe. El modelo de datos ya está diseñado para que un futuro modelo use los mismos atributos como features, sin rediseño. Ver `docs/data-model.md` y `docs/roadmap.md`.

**¿Por qué se cerró el proyecto?**
Por costos, no por límites técnicos: una facturación inesperada evidenció que faltaban controles de gasto. Está documentado sin maquillar en [ADR-0008](docs/adr/0008-pausa-por-costos-rediseno-free-tier.md).

---

## 🏁 Cierre del proyecto

Refugia se cerró completo y por una razón concreta: **el costo**. Una facturación inesperada de AWS dejó una lección que vale tanto como cualquier feature del proyecto.

> **FinOps & Cost Awareness:** Implementé un presupuesto de tolerancia cero (*Zero-Spend Budget*) en AWS tras identificar recursos huérfanos (Volúmenes EBS, Secretos) durante el despliegue de pruebas. Comprendí la importancia de apagar los recursos que no están dentro del Free Tier inmediatamente después de las demos.

**Qué quedó como aprendizaje:**
- El Free Tier se *diseña*, pero también se *monitorea*: calcularlo en el papel no alcanza sin alertas activas desde el día uno.
- Los recursos "huérfanos" (volúmenes, secretos) siguen cobrando aunque el servicio principal esté apagado — apagar bien es parte del diseño.
- Un presupuesto de tolerancia cero convierte cualquier gasto inesperado en una alerta inmediata, no en una sorpresa mensual.
- Decidir *cerrar* un proyecto a tiempo, con todo documentado, es una decisión de arquitectura y de gestión — no un fracaso.

---

## 💼 Este proyecto demuestra

**Cloud & Solution Architecture**
- Decisiones de arquitectura documentadas con alternativas y trade-offs (8 ADRs), incluidos los errores reales y lo que costaron — no una versión pulida después del hecho

**Infrastructure as Code**
- AWS completo gestionado con Terraform: cómputo, base de datos, storage, secretos, IAM, CDN y CI/CD vía OIDC

**Operación real, no solo diseño**
- CI/CD depurado a través de 6 fallos reales resueltos en producción; hardening de seguridad aplicado y verificado

**FinOps & Cost Awareness**
- Incidente de costos real, analizado, documentado y convertido en controles (Zero-Spend Budget) y en la decisión consciente de cerrar el proyecto

**Honestidad técnica**
- Estado del proyecto documentado sin inflar, en todo momento — incluido el cierre

---

## 📝 Licencia

Proyecto académico y de portfolio profesional.

*Code made by Emmanuel Ledesma*
🔗 [linkedin.com/in/emmanuel-ledesmam](https://www.linkedin.com/in/emmanuel-ledesmam)

---

# English Version

# 🐾 Refugia

**Operations management platform for animal shelters in Buenos Aires City — the back-office layer the official city platform doesn't cover**

## 📌 Concept

A shelter volunteer can register an animal, log its clinical history, upload photos, and find adoption candidates ranked by a compatibility score — without relying on WhatsApp and spreadsheets.

Academic project (Digital Business Administration course, Universidad de la Ciudad de Buenos Aires) and technical portfolio project. The focus is demonstrating **Solution Architecture judgment**, documented with ADRs — including real mistakes and their cost.

## 🏁 Status: complete and closed

Refugia was built through to the end of its planned scope and then **closed**. It ran end-to-end on AWS (Terraform IaC, CI/CD, HTTPS, frontend, API, database, photo uploads) and everything listed above was tested in real production while it was up.

**The AWS infrastructure was taken down for cost reasons**, not technical ones: an unexpected bill showed the design lacked active spending controls (see ADR-0008). Instead of keeping resources running outside the Free Tier, the project was closed at this point. The code, Terraform, pipelines and documentation remain as technical evidence, and **everything runs locally at zero cost** → `docs/local-development.md`.

## 🏁 Project closing

> **FinOps & Cost Awareness:** I implemented a zero-spend budget (*Zero-Spend Budget*) on AWS after identifying orphaned resources (EBS volumes, secrets) during test deployments. I learned the importance of shutting down any resource outside the Free Tier immediately after demos.

**Takeaways:** the Free Tier has to be *monitored*, not just *designed*; orphaned resources keep billing even when the main service is off; a zero-spend budget turns any unexpected cost into an immediate alert; and closing a project on time, fully documented, is an architecture and management decision — not a failure.

## 💼 This project demonstrates

**Cloud & Solution Architecture** — documented trade-off decisions (8 ADRs), including real failures and their cost
**Infrastructure as Code** — full AWS stack managed with Terraform, CI/CD via OIDC
**Real operations, not just design** — CI/CD debugged through 6 real production failures, security hardening applied and verified
**FinOps & Cost Awareness** — a real cost incident analyzed, documented and turned into controls (Zero-Spend Budget) and a conscious decision to close the project
**Technical honesty** — status reported without inflating, at every point — including the closing

---

*Code made by Emmanuel Ledesma*
🔗 [linkedin.com/in/emmanuel-ledesmam](https://www.linkedin.com/in/emmanuel-ledesmam)

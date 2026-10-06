# 🐾 Refugia

**Plataforma de gestión operativa para refugios de animales en CABA — la capa de back-office que la plataforma estatal "Animales BA" no cubre**

[![AWS](https://img.shields.io/badge/AWS-Elastic_Beanstalk-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com)
[![Terraform](https://img.shields.io/badge/Terraform-1.5+-7B42BC?style=flat-square&logo=terraform&logoColor=white)](https://terraform.io)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Status](https://img.shields.io/badge/status-pausado_por_costos-orange?style=flat-square)](#-estado-actual)

🔗 [LinkedIn](https://www.linkedin.com/in/emmanuel-ledesmam) · [GitHub](https://github.com/EmmaLedesma)

---

## 📌 Concepto

Un rescatista de un refugio puede fichar un animal, registrar su historia clínica por tipo de evento, subir fotos, y encontrar candidatos de adopción compatibles según un score calculado — sin depender de WhatsApp y planillas de Excel.

Proyecto académico (materia *Administración de Negocios Digitales*, Licenciatura en Tecnologías Digitales — Universidad de la Ciudad de Buenos Aires) y proyecto de portfolio técnico. El foco no es cobertura funcional completa, sino demostrar **criterio de Solution Architecture** sobre un problema de negocio real: cada decisión de arquitectura está documentada como ADR, con alternativas consideradas y trade-offs explícitos — incluidos los errores y lo que costaron.

---

## 🚧 Estado actual

**⚠️ Infraestructura de AWS pausada temporalmente por control de costos — ver [ADR-0008](docs/adr/0008-pausa-por-costos-rediseno-free-tier.md).** El proyecto llegó a tener infraestructura completa, CI/CD y frontend funcionando en producción real (todo lo documentado abajo estuvo efectivamente desplegado y probado) — ese estado queda como hito cerrado y evidencia técnica. Mientras se resuelve la reactivación, **el proyecto corre 100% local, sin AWS y sin costo** — ver [docs/local-development.md](docs/local-development.md).

| Componente | Estado |
|---|---|
| Infraestructura AWS (Terraform) | 🟡 Definida como código, pausada en AWS — ver ADR-0008 |
| Correr en local (sin AWS) | ✅ Guía completa en [docs/local-development.md](docs/local-development.md) |
| Base de datos (esquema) | ✅ 8 tablas, migraciones versionadas (`sequelize-cli`) |
| API (animales, adoptantes, postulaciones, auth, historia clínica, fotos) | ✅ Funcional — probada end-to-end en producción real (mientras estuvo arriba) |
| Frontend (`web/`) | ✅ Home, ficha con historia clínica y galería, postulación, panel del staff |
| Fotos (RF10) | ✅ Upload real vía URLs presignadas de S3 — ver [ADR-0007](docs/adr/0007-upload-fotos-s3-presigned.md) (no disponible en modo local) |
| HTTPS + hosting del frontend | ✅ CloudFront (S3 + API bajo `/api`) — ver [ADR-0005](docs/adr/0005-https-y-hosting-frontend.md) |
| CI/CD | ✅ GitHub Actions vía OIDC — ver [ADR-0006](docs/adr/0006-cicd-github-actions.md) |
| Hardening de seguridad | ✅ RDS restringido al SG real de Beanstalk, sin `AdministratorAccess` en el usuario de deploy |
| Control de costos (AWS Budgets) | ⬜ Pendiente — la omisión que causó la pausa, ver ADR-0008 |

---

## 🏗️ Arquitectura (diseño completo, parcialmente pausado en AWS)

```
┌─────────────────────────────────────────────────────────────┐
│              Frontend (S3 + CloudFront) / local              │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS (AWS) / HTTP (local)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│         AWS Elastic Beanstalk (instancia única)              │
│              Node.js 22 + Express — API REST                │
│                                                               │
│  Rutas → Controllers → Services (matching) → Modelos (Sequelize)
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────┐      ┌───────────────────────┐
│   AWS RDS /       │      │       AWS S3          │
│   Postgres local  │      │  fotos-animales       │
│  (8 tablas,        │      │  (solo en AWS)        │
│   migraciones      │      └───────────────────────┘
│   versionadas)      │
└──────────────────┘
           ▲
           │ credenciales (SSM en AWS, .env en local)
┌──────────────────────────────────────────────────┐
│         AWS SSM Parameter Store                  │
└────────────────────────────────────────────────────┘
```

---

## 🚀 Recursos AWS definidos (Terraform — ver estado real en ADR-0008)

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
- Migraciones versionadas, seeder con datos ricos (scores reales de matching, no inventados)
- Historia clínica completa (RF2): alta y consulta de eventos clínicos, UI en la ficha del animal
- Scoring de matching por reglas ponderadas (RF6), validado con casos de score alto/medio/bajo
- Fotos con upload real vía S3 presignado (RF10) — solo en AWS
- Login + panel de staff, CRUD de animales/adoptantes/postulaciones con aceptar/rechazar
- Frontend de 4 páginas, estética inspirada en Animales BA con identidad propia
- Infraestructura 100% como código (Terraform), CI/CD con GitHub Actions vía OIDC
- Hardening de seguridad: RDS solo acepta tráfico del SG real de Beanstalk, sin `AdministratorAccess` en el usuario de deploy

## ⬜ Pendiente

- AWS Budgets con alertas (la omisión que causó la pausa — ver ADR-0008)
- Rediseño verificado contra límites reales de free tier
- Matching por Machine Learning (Fase 2, plus del TP — ver [roadmap](docs/roadmap.md))
- Red de hogares de tránsito, módulo de padrinos/donaciones, multi-refugio

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| API | Node.js 22 + Express |
| ORM | Sequelize (dialecto `postgres`) |
| Base de datos | PostgreSQL (RDS en AWS / Docker en local) |
| Storage de fotos | AWS S3 (solo en AWS) |
| Hosting | AWS Elastic Beanstalk (instancia única) |
| Secretos | AWS SSM Parameter Store (AWS) / `.env` (local) |
| Auth | JWT propio |
| IaC | Terraform |
| CI/CD | GitHub Actions, OIDC (sin credenciales guardadas) |

---

## 🔐 Seguridad

- Secretos nunca en el repo (`.env`, `terraform.tfvars` en `.gitignore`; SSM Parameter Store en AWS)
- RDS restringido al security group real de Beanstalk (no abierto a toda la VPC)
- Usuario de deploy (`refugia-deploy`) sin `AdministratorAccess` — policies de AWS por servicio + policy propia acotada por nombre de recurso para IAM/SSM
- **Deuda pendiente, con causa y efecto documentados**: no había AWS Budgets ni alarmas de billing — eso llevó a una factura inesperada y a la pausa actual del proyecto (ver [ADR-0008](docs/adr/0008-pausa-por-costos-rediseno-free-tier.md)). Es la próxima prioridad de seguridad/operación antes de reactivar nada.

---

## 📁 Estructura del proyecto

```
refugia/
├── README.md
├── docs/
│   ├── requirements.md, data-model.md, roadmap.md, infrastructure.md
│   ├── local-development.md   # correr todo sin AWS
│   └── adr/            # 0001-0008, decisiones documentadas con trade-offs (incluye errores y su costo)
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

**Local, sin AWS, costo cero** (recomendado mientras dure la pausa) → ver [docs/local-development.md](docs/local-development.md)

**Contra AWS** (cuando la infraestructura esté reactivada):
```bash
cd api
cp .env.example .env   # completar credenciales reales
npm install
npm run migrate
npm run dev
```

---

## 🧭 Decisiones técnicas

**¿Por qué Elastic Beanstalk y no Lambda?**
Latencia consistente para una demo en vivo, sin cold starts. Ver [ADR-0001](docs/adr/0001-hosting-api.md).

**¿Por qué PostgreSQL normalizado y no una colección NoSQL para la historia clínica?**
Con solo 3 tipos de evento clínico fijos (vacuna, cirugía, tratamiento), la normalización es simple y se explica con un diagrama ER convencional. Ver [ADR-0003](docs/adr/0003-modelo-eventos-clinicos-orm.md).

**¿Por qué scoring por reglas y no Machine Learning desde el MVP?**
Un modelo de ML necesita historial real de adopciones para aprender algo útil — no existe todavía. El modelo de datos ya está diseñado para que un futuro modelo use los mismos atributos como features, sin rediseño. Ver `docs/data-model.md` y `docs/roadmap.md`.

**¿Por qué se pausó la infraestructura en AWS?**
Facturación inesperada por no tener AWS Budgets configurado desde el inicio — una omisión real, documentada sin maquillar. Ver [ADR-0008](docs/adr/0008-pausa-por-costos-rediseno-free-tier.md).

---

## 🔮 Roadmap

Ver [docs/roadmap.md](docs/roadmap.md) — incluye matching por ML, red de tránsitos, módulo de padrinos/donaciones, multi-refugio, y (nuevo) rediseño verificado de costos.

---

## 💼 Este proyecto demuestra

**Cloud & Solution Architecture**
- Decisiones de arquitectura documentadas con alternativas y trade-offs (8 ADRs), incluidos los errores reales y lo que costaron — no una versión pulida después del hecho

**Infrastructure as Code**
- AWS completo gestionado con Terraform: cómputo, base de datos, storage, secretos, IAM, CI/CD vía OIDC

**Operación real, no solo diseño**
- CI/CD depurado con 6 fallos reales resueltos en producción; hardening de seguridad aplicado y verificado; un incidente de costos real, documentado y convertido en rediseño

**Honestidad técnica**
- Estado del proyecto documentado sin inflar, en todo momento — incluido este mismo instante de pausa

---

## 📝 Licencia

Proyecto académico y de portfolio profesional.

*Code made by Emmanuel Ledesma*
🔗 [linkedin.com/in/emmanuel-ledesmam](https://www.linkedin.com/in/emmanuel-ledesmam)

---

# English Version

# 🐾 Refugia

**Operations management platform for animal shelters in Buenos Aires City — the back-office layer the official state platform doesn't cover**

## 📌 Concept

A shelter volunteer can register an animal, log its clinical history, upload photos, and find adoption candidates ranked by a compatibility score — without relying on WhatsApp and spreadsheets.

Academic project (Digital Business Administration course, Universidad de la Ciudad de Buenos Aires) and technical portfolio project. The focus is demonstrating **Solution Architecture judgment**, documented with ADRs — including real mistakes and their cost.

## 🚧 Current status

⚠️ **AWS infrastructure temporarily paused due to an unexpected billing cost** (no AWS Budgets had been configured — see ADR-0008). The project previously had full infrastructure, CI/CD and frontend running live in production — that state is preserved as a closed milestone and technical evidence. The project currently runs **fully locally, at zero cost** — see `docs/local-development.md`. See the Spanish section above for the full status table.

## 💼 This project demonstrates

**Cloud & Solution Architecture** — documented trade-off decisions, including real failures and their cost, not a polished-after-the-fact version
**Infrastructure as Code** — full AWS stack managed with Terraform, CI/CD via OIDC
**Real operations, not just design** — CI/CD debugged through 6 real production failures, security hardening applied and verified, a real cost incident documented and turned into a redesign
**Technical honesty** — status reported without inflating, at every point — including this very pause

---

*Code made by Emmanuel Ledesma*
🔗 [linkedin.com/in/emmanuel-ledesmam](https://www.linkedin.com/in/emmanuel-ledesmam)

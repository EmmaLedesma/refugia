# 🐾 Refugia

**Plataforma de gestión operativa para refugios de animales en CABA — la capa de back-office que la plataforma estatal "Animales BA" no cubre**

[![AWS](https://img.shields.io/badge/AWS-Elastic_Beanstalk-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com)
[![Terraform](https://img.shields.io/badge/Terraform-1.5+-7B42BC?style=flat-square&logo=terraform&logoColor=white)](https://terraform.io)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-RDS-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://aws.amazon.com/rds/postgresql/)
[![Status](https://img.shields.io/badge/status-en_desarrollo-yellow?style=flat-square)](#-estado-actual)

🔗 [LinkedIn](https://www.linkedin.com/in/emmanuel-ledesmam) · [GitHub](https://github.com/EmmaLedesma)

---

## 📌 Concepto

Un rescatista de un refugio puede fichar un animal, registrar su historia clínica por tipo de evento, y encontrar candidatos de adopción compatibles según un score calculado — sin depender de WhatsApp y planillas de Excel.

Proyecto académico (materia *Administración de Negocios Digitales*) y proyecto de portfolio técnico. El foco no es cobertura funcional completa, sino demostrar **criterio de Solution Architecture** sobre un problema de negocio real: cada decisión de arquitectura está documentada como ADR, con alternativas consideradas y trade-offs explícitos.

---

## 🚧 Estado actual

**Infraestructura, datos y API: desplegados y funcionando de punta a punta.**

| Componente | Estado |
|---|---|
| Infraestructura AWS (Terraform) | ✅ 16 recursos creados y corriendo |
| Base de datos (esquema) | ✅ 8 tablas migradas en RDS real |
| Deploy del código a Elastic Beanstalk | ✅ Corriendo (`v1`) |
| Login (JWT) | ✅ Funcional — usuario único de staff (ver ADR-0002) |
| Endpoint `animales` (RF1, RF3, RF4, RF9) | ✅ Funcional — probado end-to-end en producción |
| Endpoints `adoptantes` / `postulaciones` | ✅ Funcional — validado con datos ricos y scores diferenciados |
| Frontend (`web/`) | ✅ Home pública, formulario de postulación y panel del staff — HTML/CSS/JS plano, sin build tooling, consumiendo la API real |
| HTTPS | ⬜ Pendiente — el entorno solo sirve HTTP por ahora |
| CI/CD | ⬜ Pendiente — deploy manual por ahora |

Demo funcional: `http://refugia-dev-env.eba-f3ywkdbu.sa-east-1.elasticbeanstalk.com` (API) — el frontend (`web/`) se abre localmente por ahora, todavía no está hosteado.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Cliente (futuro frontend /                │
│                     Postman / curl por ahora)                │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
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
│   AWS RDS         │      │       AWS S3          │
│   PostgreSQL       │      │  fotos-animales       │
│  (8 tablas,        │      │  (galería por animal) │
│   migraciones      │      └───────────────────────┘
│   versionadas)      │
└──────────────────┘
           ▲
           │ credenciales
┌──────────────────────────────────────────────────┐
│         AWS SSM Parameter Store                  │
│    db_password, jwt_secret (SecureString)        │
└──────────────────┬───────────────────────────────┘
                   │ leídos vía IAM Role (SystemAssigned)
                   ▼
        Instancias EC2 de Elastic Beanstalk
                   │
                   ▼
              AWS CloudWatch (logs y métricas)
```

---

## 🚀 Recursos AWS provisionados

| Recurso | Nombre | Definido en |
|---|---|---|
| Elastic Beanstalk App + Env | `refugia-dev` / `refugia-dev-env` | `infra/terraform/main.tf` |
| RDS PostgreSQL | `refugia-dev-db` (db.t3.micro) | `infra/terraform/main.tf` |
| S3 Bucket | `refugia-dev-fotos-animales` | `infra/terraform/main.tf` |
| Security Group (RDS) | `refugia-dev-rds-sg` | `infra/terraform/main.tf` |
| SSM Parameters (SecureString) | `/refugia-dev/db_password`, `/refugia-dev/jwt_secret` | `infra/terraform/main.tf` |
| IAM Role + Instance Profile | `refugia-dev-eb-instance-role` | `infra/terraform/main.tf` |

**Total: 16 recursos gestionados como código (Terraform)**

---

## ✅ Features implementadas / ⬜ pendientes

- ✅ Modelo de datos completo (Animal, Foto, EventoClinico + Vacuna/Cirugía/Tratamiento normalizados, Adoptante, Postulación)
- ✅ Migraciones versionadas (`sequelize-cli`), corridas contra la base real
- ✅ Scoring de matching por reglas ponderadas (RF6) — diseñado para evolucionar a ML sin cambiar el modelo de datos (ver [roadmap](docs/roadmap.md))
- ✅ Infraestructura 100% como código (Terraform), con secretos fuera del repo (SSM)
- ⬜ Deploy del código a Elastic Beanstalk
- ⬜ CRUD completo de adoptantes y postulaciones
- ⬜ Autenticación funcional end-to-end
- ⬜ CI/CD con GitHub Actions
- ⬜ Matching por Machine Learning (Fase 2, plus del TP — ver roadmap)

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| API | Node.js 22 + Express |
| ORM | Sequelize (dialecto `postgres`) |
| Base de datos | AWS RDS PostgreSQL |
| Storage de fotos | AWS S3 |
| Hosting | AWS Elastic Beanstalk (instancia única) |
| Secretos | AWS SSM Parameter Store |
| Auth | JWT propio |
| Observabilidad | AWS CloudWatch |
| IaC | Terraform |
| CI/CD | GitHub Actions (planeado, no implementado aún) |

---

## 🔐 Seguridad

- Secretos (`db_password`, `jwt_secret`) en SSM Parameter Store, nunca en el repo — leídos en runtime vía IAM Role
- `.env` y `terraform.tfvars` en `.gitignore`
- **Deuda de seguridad conocida y documentada** (no oculta): el security group de RDS acepta el puerto 5432 desde la VPC por defecto completa, y el usuario IAM de deploy tiene `AdministratorAccess` en vez de permisos acotados — ambas son simplificaciones deliberadas para priorizar velocidad de iteración mientras el proyecto está en desarrollo activo, señaladas en [ADR-0004](docs/adr/0004-costos-infraestructura.md), y planificadas para endurecerse en la recta final, una vez que el MVP tenga interfaz y esté listo para mostrarse.

---

## 📁 Estructura del proyecto

```
refugia/
├── README.md
├── docs/
│   ├── requirements.md, data-model.md, roadmap.md, infrastructure.md
│   └── adr/            # 0001-0004, decisiones documentadas con trade-offs
├── infra/terraform/     # Toda la infraestructura AWS como código
└── api/
    ├── .sequelizerc
    └── src/
        ├── config/       # conexión DB, secretos SSM, config sequelize-cli
        ├── models/        # Sequelize — 8 entidades
        ├── migrations/    # 8 migraciones versionadas
        ├── seeders/       # datos de demo (usa el matchingService real, no scores inventados)
        ├── controllers/, routes/   # animales, adoptantes, postulaciones, auth
        ├── services/      # matchingService (scoring)
        └── middleware/    # auth (JWT), errorHandler
```

`web/` (frontend): HTML/CSS/JS plano, sin build tooling — decisión deliberada para MVP rápido sin agregar complejidad de tooling que el problema no pide todavía.
- `index.html` — home pública, lista animales disponibles en vivo desde la API
- `postular.html` — cuestionario de adoptante + postulación, muestra el score calculado
- `staff.html` — login + panel: alta de animales, postulaciones ordenadas por score con aceptar/rechazar
- `assets/style.css` — diseño inspirado en la estética institucional de [Animales BA](https://buenosaires.gob.ar/inicio/animales-ba) (navy/teal, cards con acento), con un acento ámbar propio reservado para los momentos de adopción

---

## ⚡ Quick Start (desarrollo local)

```bash
cd api
cp .env.example .env   # completar credenciales de la RDS real
npm install
npm run migrate         # aplica el esquema si no está creado
npm run dev
```

Frontend: abrir `web/index.html` directo en el navegador (sin servidor ni build) — llama a la API real desplegada en AWS.

---

## 🧭 Decisiones técnicas

**¿Por qué Elastic Beanstalk y no Lambda?**
Latencia consistente para una demo en vivo, sin cold starts. Ver [ADR-0001](docs/adr/0001-hosting-api.md).

**¿Por qué PostgreSQL normalizado y no una colección NoSQL para la historia clínica?**
Con solo 3 tipos de evento clínico fijos (vacuna, cirugía, tratamiento), la normalización es simple y se explica con un diagrama ER convencional. Ver [ADR-0003](docs/adr/0003-modelo-eventos-clinicos-orm.md).

**¿Por qué scoring por reglas y no Machine Learning desde el MVP?**
Un modelo de ML necesita historial real de adopciones para aprender algo útil — no existe todavía. El modelo de datos ya está diseñado para que un futuro modelo use los mismos atributos como features, sin rediseño. Ver `docs/data-model.md` y `docs/roadmap.md`.

**¿Por qué AWS y no otro proveedor?**
Ya hay experiencia hands-on previa con AWS (ver [Shem72](https://github.com/EmmaLedesma) en el portfolio), lo que permite iterar rápido sobre servicios ya conocidos (RDS, S3, IAM, Elastic Beanstalk) en vez de invertir tiempo de aprendizaje de plataforma en un proyecto con foco en modelado y arquitectura, no en explorar un proveedor nuevo.

---

## 🔮 Roadmap

Ver [docs/roadmap.md](docs/roadmap.md) — incluye matching por ML, red de tránsitos, módulo de padrinos/donaciones, multi-refugio.

---

## 💼 Este proyecto demuestra

**Cloud & Solution Architecture**
- Decisiones de arquitectura documentadas con alternativas y trade-offs (ADRs), no solo código

**Infrastructure as Code**
- AWS completo gestionado con Terraform: cómputo, base de datos, storage, secretos, IAM

**Modelado de datos**
- Normalización relacional justificada, migraciones versionadas en vez de sync automático

**Honestidad técnica**
- Estado del proyecto documentado sin inflar: qué está desplegado, qué falta, qué deuda técnica se aceptó y por qué

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

A shelter volunteer can register an animal, log its clinical history by event type, and find adoption candidates ranked by a compatibility score — without relying on WhatsApp and spreadsheets.

Academic project (Digital Business Administration course) and technical portfolio project. The focus is not full feature coverage but demonstrating **Solution Architecture judgment** on a real business problem: every architecture decision is documented as an ADR, with alternatives and explicit trade-offs.

## 🚧 Current status

**Infrastructure and data: deployed and running. API code: not deployed yet.** No live demo yet — the badge gets added once the API is actually serving traffic. See the Spanish section above for the full status table.

## 💼 This project demonstrates

**Cloud & Solution Architecture** — documented trade-off decisions, not just code
**Infrastructure as Code** — full AWS stack managed with Terraform
**Data modeling** — justified relational normalization, versioned migrations
**Technical honesty** — status reported without inflating: what's deployed, what's pending, what technical debt was accepted and why

---

*Code made by Emmanuel Ledesma*
🔗 [linkedin.com/in/emmanuel-ledesmam](https://www.linkedin.com/in/emmanuel-ledesmam)

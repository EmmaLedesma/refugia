# ADR-0005: Migración de infraestructura de Azure a AWS

**Estado:** Aceptada — reemplaza [ADR-0001](0001-hosting-api.md), [ADR-0002](0002-auth.md) y [ADR-0004](0004-costos-infraestructura.md)

## Contexto
El MVP se diseñó originalmente sobre Azure (ver ADRs 0001, 0002, 0004). Al intentar crear la cuenta de Azure, la tarjeta prepaga disponible no fue aceptada por el proceso de verificación de pago. No se cuenta con email institucional de IFTS N°18 para calificar a Azure for Students (que no requiere tarjeta). En cambio, ya existen despliegues previos hechos en AWS con esa misma tarjeta prepaga, confirmando que ahí sí es aceptada.

## Alternativas consideradas
| Alternativa | Ventajas | Trade-offs |
|---|---|---|
| Insistir con Azure (buscar otro método de pago) | No se pierde el trabajo ya documentado en ADRs 0001-0004 | Sin tarjeta válida ni email institucional, no hay forma de avanzar a corto plazo |
| Migrar a AWS (elegida) | Tarjeta ya validada en esa plataforma; permite avanzar de inmediato | Reescribir Terraform, configuración de conexión a base de datos y parte de la documentación |
| Migrar a GCP | Alternativa no explorada | No hay evidencia de que la tarjeta funcione ahí tampoco; habría que validar antes, mismo riesgo que Azure |

## Decisión
Migrar toda la infraestructura a AWS, región **sa-east-1 (São Paulo)** — la más cercana a Argentina disponible en AWS.

### Mapeo de servicios (Azure → AWS)

| Función | Azure (ADR anterior) | AWS (nueva decisión) | Justificación |
|---|---|---|---|
| Hosting de la API | App Service | **Elastic Beanstalk** (Node.js, instancia única, sin load balancer) | Mismo argumento que ADR-0001: PaaS con latencia consistente. "Instancia única" evita el costo de un Application Load Balancer, que no está cubierto por el free tier — trade-off: sin alta disponibilidad, aceptable para una demo de portfolio |
| Base de datos | Azure SQL | **RDS PostgreSQL** (db.t3.micro) | Motor relacional equivalente, dentro del free tier de AWS (750 hs/mes, 20 GB). Sequelize soporta `postgres` de forma igual de madura que `mssql` — no afecta la decisión de modelo normalizado (ver ADR-0003) |
| Fotos | Blob Storage | **S3** | Equivalente directo |
| Secretos | Key Vault | **SSM Parameter Store** (SecureString) | Equivalente funcional, y a diferencia de AWS Secrets Manager (con costo por secreto), Parameter Store es gratuito — más coherente con el criterio de costo bajo del proyecto |
| Observabilidad | Application Insights | **CloudWatch** (Logs + Metrics) | Integración nativa con Elastic Beanstalk, sin configuración adicional |
| Auth | JWT propio (vs. Azure AD B2C, descartado) | JWT propio (vs. **AWS Cognito**, descartado por la misma razón) | Con un solo refugio y dos roles, un servicio de identidad gestionado sigue siendo sobredimensionado — la decisión de ADR-0002 se mantiene, solo cambia el nombre del servicio gestionado que se descarta |

## Justificación
El criterio de decisión no cambió (PaaS sobre serverless para latencia consistente, motor relacional, secretos gestionados fuera del código, bajo costo) — solo el proveedor. Se prioriza continuidad de criterio de arquitectura sobre la marca de la nube.

## Consecuencias
- Impacto en negocio: ninguno — decisión operativa, no afecta alcance funcional del MVP
- Impacto técnico: Terraform reescrito con provider `aws`; `src/config/database.js` cambia el dialecto de Sequelize de `mssql` a `postgres`; variables de entorno actualizadas (ver `.env.example`)
- Riesgo asumido: instancia única de Elastic Beanstalk y RDS sin Multi-AZ implican sin alta disponibilidad — mismo nivel de riesgo aceptado que en la versión Azure (RNF2 ya declaraba esto explícitamente, no es un cambio de postura)
- Riesgo de seguridad a resolver en la próxima etapa: para simplificar el MVP, RDS se configura inicialmente con acceso público limitado por security group (no completamente abierto) — evaluar en Etapa 8 si conviene restringirlo más (VPC privada) antes de cualquier demo pública prolongada
- Los ADRs 0001, 0002 y 0004 se conservan como registro histórico de la decisión original, marcados como reemplazados

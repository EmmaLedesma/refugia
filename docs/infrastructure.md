# Infraestructura — Refugia MVP (AWS)

Provisionada íntegramente con Terraform (`infra/terraform/`), región **sa-east-1 (São Paulo)**.

## Recursos

| Recurso | AWS Service | Propósito |
|---|---|---|
| API | Elastic Beanstalk (instancia única, Node.js 20) | Hosting de la API |
| Base de datos | RDS PostgreSQL (db.t3.micro) | Modelo relacional — ver [docs/data-model.md](data-model.md) |
| Fotos | S3 | Galería de fotos de animales (RF10), lectura pública vía bucket policy |
| Secretos | SSM Parameter Store (SecureString) | `db_password`, `jwt_secret` |
| Observabilidad | CloudWatch (Logs + Metrics) | Integración nativa con Elastic Beanstalk — RNF3 |
| IAM | Instance Profile dedicado | Acceso mínimo necesario: leer parámetros propios en SSM, leer/escribir en el bucket S3 |

## Cómo se conectan los secretos

Las instancias de Elastic Beanstalk tienen un rol IAM con permiso de lectura **solo** sobre los parámetros bajo `/refugia-<env>/*` en SSM. `src/config/secrets.js` los lee en el arranque del server (solo en `NODE_ENV=production`) y los inyecta en `process.env`. En desarrollo local se usa `.env` directamente.

## Cómo desplegar

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # completar con credenciales reales
terraform init
terraform plan
terraform apply
```

`terraform.tfvars` está en `.gitignore` — nunca se commitea con credenciales reales.

## Riesgo de seguridad conocido (MVP)

RDS está configurado con `publicly_accessible = true` y el security group permite el puerto 5432 desde cualquier IP dentro de la VPC por defecto — una simplificación deliberada para el MVP, documentada en el ADR-0004. Antes de una demo pública prolongada, conviene restringir el security group de RDS para aceptar tráfico únicamente desde el security group de Elastic Beanstalk.

## Costos (estimado, no verificado con calculadora oficial)

Diseñado para el free tier de AWS: EC2 t3.micro (Beanstalk, instancia única, sin load balancer), RDS db.t3.micro, S3 con uso bajo, SSM Parameter Store (gratuito para SecureString estándar). Esto es una estimación de diseño, no una cotización — correr la [AWS Pricing Calculator](https://calculator.aws/) antes de dejarlo corriendo por períodos largos.

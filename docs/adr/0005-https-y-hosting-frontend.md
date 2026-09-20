# ADR-0005: HTTPS y hosting del frontend con CloudFront (sin Load Balancer)

**Estado:** Aceptada

## Contexto
Refugia necesitaba HTTPS (el entorno de Elastic Beanstalk solo sirve HTTP) y una forma de hostear el frontend (`web/`), que hasta ahora solo se abría como archivo local. El camino estándar para HTTPS en Elastic Beanstalk requiere un Application Load Balancer con un certificado ACM — pero ya se había decidido explícitamente evitar el ALB por costo (ver ADR-0001, ADR-0004).

## Alternativas consideradas
| Alternativa | Ventajas | Trade-offs |
|---|---|---|
| Elastic Beanstalk con load balancer + ACM | Patrón "estándar" de AWS | Revierte la decisión de costo de ADR-0001/0004; agrega un componente más a mantener |
| CloudFront delante de Beanstalk (elegida) | HTTPS gratis con certificado propio de CloudFront (`*.cloudfront.net`), sin ACM ni dominio; además permite hostear el frontend en el mismo dominio | Requiere entender cache behaviors y origin request policies para no romper el paso de headers de auth |

## Decisión
Una distribución de CloudFront con dos orígenes:
- **Frontend**: bucket S3 privado (`refugia-dev-web`), accedido solo por CloudFront vía Origin Access Control — nunca público directo
- **API**: el entorno de Elastic Beanstalk existente, bajo el path `/api/*`, con la policy administrada `AllViewer` para reenviar correctamente el header `Authorization` (JWT) y todos los query strings

Resultado: **una sola URL HTTPS** sirve todo el proyecto — el frontend en la raíz, la API bajo `/api`.

## Justificación
Resuelve HTTPS y el hosting del frontend en un solo componente, sin revertir la decisión de costo ya tomada sobre Beanstalk. El frontend queda además same-origin con la API (ya no hace falta CORS cross-origin para el flujo principal), simplificando el código del lado del cliente.

## Consecuencias
- Impacto técnico: el frontend usa rutas relativas (`/api/...`) cuando se sirve por CloudFront, y la URL absoluta de Beanstalk solo como fallback al abrir el archivo localmente (`location.protocol === 'file:'`)
- Riesgo asumido: la caché de CloudFront para `/api/*` está deshabilitada (`CachingDisabled`) a propósito, para no servir datos desactualizados — si el proyecto necesitara escalar tráfico, ahí sí valdría la pena cachear selectivamente endpoints de solo lectura
- Deploy: el contenido de `web/` se sube a S3 con `aws s3 sync` (no gestionado como recursos individuales en Terraform, ya que cambia con cada iteración de frontend) y requiere invalidar la caché de CloudFront tras cada actualización

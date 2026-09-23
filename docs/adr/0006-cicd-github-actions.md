# ADR-0006: CI/CD con GitHub Actions vía OIDC

**Estado:** Aceptada

## Contexto
Hasta ahora, cada deploy (API y frontend) se hacía a mano: empaquetar, subir a S3, crear versión de Beanstalk, actualizar el entorno, o sincronizar el bucket del frontend e invalidar CloudFront. Son ~6-8 comandos encadenados por deploy, con varios errores humanos ya ocurridos en el proceso (parámetros de PowerShell, variables de sesión perdidas). Automatizarlo con GitHub Actions requiere que el workflow tenga credenciales de AWS.

## Alternativas consideradas
| Alternativa | Ventajas | Trade-offs |
|---|---|---|
| Access Key/Secret de `refugia-deploy` como GitHub Secret | Simple de configurar | Credencial de larga duración fuera de AWS, en un tercero; si se filtra, sigue siendo válida hasta que alguien la rote a mano |
| OIDC (elegida) | Sin credenciales guardadas — GitHub pide un token temporal por cada corrida, válido solo para ese run; revocable centralizado desde IAM | Configuración inicial más compleja (OIDC provider + rol con trust policy) |

## Decisión
OIDC, con un rol de IAM (`refugia-dev-github-actions`) acotado a:
- Solo puede ser asumido por el repo `EmmaLedesma/refugia`, y solo desde la rama `main` (condición `sub` en la trust policy)
- Permisos mínimos: subir el zip de deploy a `s3://refugia-dev-fotos-animales/deploys/*`, sincronizar el bucket del frontend, crear versiones de Beanstalk y actualizar el entorno, invalidar CloudFront — nada de RDS, IAM, ni otros servicios

Dos workflows separados (`deploy-api.yml`, `deploy-frontend.yml`), cada uno disparado solo por cambios en su propia carpeta (`api/**` o `web/**`) — evita deploys innecesarios cuando se toca documentación o el otro componente.

## Justificación
El rol de CI es independiente del usuario `refugia-deploy` que usás localmente — esta decisión no depende de ni contradice la decisión de posponer el hardening de ese usuario. Es una identidad nueva, acotada desde el día uno, sin fricción con lo que ya existe.

## Consecuencias
- Impacto técnico: `git push` a `main` con cambios en `api/` o `web/` dispara el deploy correspondiente automáticamente
- Riesgo reducido: elimina la clase de error "olvidé un paso" o "variable de PowerShell perdida" que ya ocurrió varias veces en el deploy manual
- Riesgo asumido: si el workflow tiene un bug, se ejecuta automáticamente en cada push — por eso el alcance de permisos del rol es mínimo (no puede tocar RDS, IAM ni SSM)
- Los comandos manuales documentados en `docs/infrastructure.md` quedan como referencia/fallback, no como el flujo principal

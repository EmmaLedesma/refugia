# ADR-0007: Upload de fotos con URLs presignadas de S3

**Estado:** Aceptada

## Contexto
El modelo `Foto` existía desde la Etapa 6 pero sin ningún mecanismo real para llenarlo. Se evaluó primero una versión mínima (pegar una URL de imagen ya alojada en otro lado) para priorizar velocidad, pero se decidió construir el upload real — es una pieza que un Solution Architect debería mostrar bien resuelta.

## Alternativas consideradas
| Alternativa | Ventajas | Trade-offs |
|---|---|---|
| Pegar URL externa | Cero trabajo de infraestructura | No es "un producto real" — depende de que el staff aloje la imagen en otro servicio |
| Upload a través del servidor Node (multer) | Simple de entender | El archivo viaja dos veces (navegador→Node→S3); la instancia única de Beanstalk carga con el tráfico de cada imagen, sin necesidad |
| **URLs presignadas de S3 (elegida)** | El navegador sube directo a S3 — el servidor nunca ve el binario, solo genera un permiso temporal | Requiere configurar CORS en el bucket y dos llamadas a la API (presign + confirmar) en vez de una |

## Decisión
Flujo en dos pasos:
1. `POST /api/animales/:id/fotos/presign` (staff) — valida tipo de imagen (jpg/png/webp) y tamaño declarado, devuelve una URL de S3 firmada con `PutObjectCommand`, válida 5 minutos
2. El navegador hace `PUT` directo a esa URL con el archivo
3. `POST /api/animales/:id/fotos` (staff) — confirma el upload y crea el registro `Foto` en la base, con la URL pública final

CORS en el bucket de fotos habilita `PUT` desde cualquier origen — aceptable porque el `PUT` solo es válido con una URL presignada de 5 minutos generada tras autenticación, no por tener el origen abierto en sí.

## Justificación
Es el patrón estándar de AWS para upload de archivos desde el navegador: descarga trabajo del backend, no satura la instancia única de Beanstalk con tráfico de archivos binarios, y es exactamente el tipo de decisión que se espera poder explicar en una entrevista de Solution Architecture.

## Consecuencias
- Impacto técnico: nueva dependencia (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`); nuevo bucket CORS rule en Terraform
- Limitación conocida y aceptada: el límite de 5MB se valida en el cliente (JS) y se declara en la solicitud de presign, pero **no hay un límite duro enforced por S3** en el PUT en sí (requeriría un presigned POST con `content-length-range`, más complejo) — alguien que modifique el JS del cliente podría subir un archivo más grande. Para un MVP de portfolio es un riesgo aceptado; para producción real, migrar a presigned POST con esa condición
- Si el proyecto necesitara procesar imágenes (miniaturas, compresión), el punto de extensión natural es un trigger de S3 (Lambda) al completarse el upload — no implementado, fuera de alcance del MVP

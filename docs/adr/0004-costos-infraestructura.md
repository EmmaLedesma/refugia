# ADR-0004: Tiers de bajo costo para infraestructura de portfolio

**Estado:** Aceptada

## Contexto
Refugia es un proyecto personal de portfolio, sin financiamiento ni tráfico productivo real. La infraestructura en AWS debe minimizar costo sin comprometer la posibilidad de hacer una demo funcional.

## Alternativas consideradas
| Recurso | Alternativa elegida | Alternativa descartada | Por qué se descartó |
|---|---|---|---|
| Elastic Beanstalk | Instancia única (t3.micro), sin load balancer | Entorno con Application Load Balancer | El ALB no está cubierto por el free tier y no aporta valor para el tráfico esperado de una demo |
| RDS | `db.t3.micro`, single-AZ | Instancia mayor o Multi-AZ | Basta para el volumen de datos de un MVP de portfolio; Multi-AZ no se justifica sin carga real |
| S3 | Uso estándar, sin replicación cross-region | Replicación multi-región | El proyecto no requiere alta disponibilidad geográfica |

## Decisión
Elastic Beanstalk en instancia única (t3.micro), RDS `db.t3.micro` single-AZ, S3 estándar — documentados como decisión explícita, no como default sin revisar.

## Justificación
El objetivo es una demo confiable y barata, no un sistema productivo. Elegir el tier mínimo que **no comprometa la estabilidad de una demo en vivo** es el balance correcto para este contexto — de ahí, por ejemplo, mantener Elastic Beanstalk como PaaS con latencia consistente en vez de optar por el camino más barato posible (ver ADR-0001).

## Consecuencias
- Impacto en negocio: ninguno — decisión puramente de costo/portfolio
- Riesgo asumido: estos tiers no soportarían tráfico productivo real; si el proyecto evolucionara más allá de portfolio, esta decisión debe revisarse explícitamente (nuevo ADR)
- Costo aproximado: diseñado para el free tier de AWS, pero no verificado con la calculadora oficial — pendiente de validar antes de dejar la infraestructura corriendo por períodos largos

# ADR-0001: Hosting de la API en AWS Elastic Beanstalk

**Estado:** Aceptada

## Contexto
Refugia necesita una API REST para el MVP (gestión de animales + adopción). El proyecto es una demo de portfolio/académica, con recursos limitados y probable exposición en entrevistas técnicas en vivo.

## Alternativas consideradas
| Alternativa | Ventajas | Trade-offs |
|---|---|---|
| Elastic Beanstalk (PaaS, instancia única) | Latencia consistente (sin cold start relevante), debugging local simple, natural para una API REST con múltiples recursos | Costo base algo mayor que serverless en reposo (mitigado usando instancia única, sin load balancer) |
| AWS Lambda + API Gateway (serverless) | Costo mínimo en reposo, ideal para tráfico esporádico | Cold starts pueden verse mal en demo en vivo; estructurar una API CRUD completa en Lambda es menos natural que en un framework como Express |

## Decisión
AWS Elastic Beanstalk, en modo **instancia única (sin load balancer)**, corriendo una API Node.js/Express.

## Justificación
Para una demo de portfolio con posible presentación en vivo (entrevista técnica), la latencia predecible pesa más que el ahorro marginal de costo de un enfoque serverless. Express sobre Elastic Beanstalk es también el patrón más directo de documentar y razonar en una entrevista. El modo de instancia única evita el costo de un Application Load Balancer, que no aporta valor para el tráfico esperado de una demo.

## Consecuencias
- Impacto en negocio: ninguno (decisión puramente técnica en esta etapa)
- Impacto técnico: estructura de API convencional (routes/controllers/services), sin las restricciones de un modelo serverless (timeouts, statelessness estricta)
- Riesgo asumido: sin alta disponibilidad (instancia única) — aceptable para el alcance de portfolio, declarado en RNF2
- Si el contexto cambiara (tráfico muy esporádico, foco 100% en costo, o necesidad real de alta disponibilidad): reevaluar Lambda+API Gateway o Elastic Beanstalk con load balancer

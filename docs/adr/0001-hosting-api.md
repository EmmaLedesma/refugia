# ADR-0001: Hosting de la API en Azure App Service

**Estado:** Aceptada

## Contexto
Refugia necesita una API REST para el MVP (gestión de animales + adopción). El proyecto es una demo de portfolio/académica, con recursos limitados y probable exposición en entrevistas técnicas en vivo.

## Alternativas consideradas
| Alternativa | Ventajas | Trade-offs |
|---|---|---|
| Azure App Service (PaaS) | Latencia consistente (sin cold start relevante), debugging local simple, natural para una API REST con múltiples recursos | Costo base algo mayor que serverless en reposo |
| Azure Functions (serverless) | Costo mínimo en reposo, ideal para tráfico esporádico | Cold starts pueden verse mal en demo en vivo; estructurar una API CRUD completa en Functions es menos natural |

## Decisión
Azure App Service, corriendo una API Node.js/Express.

## Justificación
Para una demo de portfolio con posible presentación en vivo (entrevista técnica), la latencia predecible pesa más que el ahorro marginal de costo en el tier bajo de Azure. Express sobre App Service es también el patrón más directo de documentar y razonar en una entrevista.

## Consecuencias
- Impacto en negocio: ninguno (decisión puramente técnica en esta etapa)
- Impacto técnico: estructura de API convencional (routes/controllers/services), sin las restricciones de Functions (timeouts, statelessness estricta)
- Riesgos asumidos: costo levemente mayor en tiers pagos si el proyecto escalara — no relevante en el alcance actual
- Si el contexto cambiara (tráfico muy esporádico, foco 100% en costo): reevaluar Azure Functions

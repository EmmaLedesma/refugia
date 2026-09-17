# ADR-0004: Tiers de bajo costo para infraestructura de portfolio

**Estado:** Aceptada

## Contexto
Refugia es un proyecto personal de portfolio, sin financiamiento ni tráfico productivo real. La infraestructura en Azure debe minimizar costo sin comprometer la posibilidad de hacer una demo funcional.

## Alternativas consideradas
| Recurso | Alternativa elegida | Alternativa descartada | Por qué se descartó |
|---|---|---|---|
| App Service Plan | B1 (Basic) | F1 (Free) | El tier Free tiene límites de CPU/tiempo de ejecución que pueden interrumpir una demo en vivo; B1 tiene costo bajo y previsible |
| Azure SQL | Basic (DTU) | Standard/General Purpose | Basic alcanza para el volumen de datos de un MVP de portfolio (2 GB); tiers superiores no se justifican sin carga real |
| Storage | LRS (redundancia local) | GRS/ZRS | El proyecto no requiere alta disponibilidad geográfica; LRS es la opción de menor costo |

## Decisión
App Service B1, Azure SQL Basic, Storage LRS — documentados como decisión explícita, no como default sin revisar.

## Justificación
El objetivo es una demo confiable y barata, no un sistema productivo. Elegir el tier mínimo que **no comprometa la estabilidad de una demo en vivo** (de ahí B1 en vez de F1) es el balance correcto para este contexto.

## Consecuencias
- Impacto en negocio: ninguno — decisión puramente de costo/portfolio
- Riesgo asumido: estos tiers no soportarían tráfico productivo real; si el proyecto evolucionara más allá de portfolio, esta decisión debe revisarse explícitamente (nuevo ADR)
- Costo aproximado: bajo pero no verificado con la calculadora oficial de Azure — pendiente de validar antes de dejar la infraestructura corriendo por períodos largos

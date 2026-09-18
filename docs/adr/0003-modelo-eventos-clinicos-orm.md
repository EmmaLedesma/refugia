# ADR-0003: Modelo de eventos clínicos normalizado + Sequelize como ORM

**Estado:** Aceptada

## Contexto
El modelo de datos requiere historia clínica con campos estructurados por tipo de evento (vacuna, cirugía, tratamiento — ver docs/data-model.md). Además, la API (Node/Express) necesita una forma de mapear el modelo relacional a código, contra una base de datos PostgreSQL en AWS RDS.

## Alternativas consideradas

**Modelo de eventos clínicos:**
| Alternativa | Ventajas | Trade-offs |
|---|---|---|
| A — Tablas por tipo (elegida) | Normalizado, valida en la base, diagrama ER claro | Nuevo tipo de evento requiere migración |
| B — Columna JSON semiestructurada | Flexible sin migraciones | Sin validación en la base, requiere disciplina en la app |

**ORM:**
| Alternativa | Ventajas | Trade-offs |
|---|---|---|
| Sequelize (elegido) | Soporte maduro y estable para `postgres`, migraciones versionadas, sintaxis de asociaciones directa (hasMany/belongsTo) que mapea 1:1 al diagrama ER ya definido | Menos "moderno" en DX que Prisma |
| Prisma | DX moderna, tipado fuerte | Menor ventaja relativa dado que el equipo ya tiene experiencia con el patrón de Sequelize |

## Decisión
Opción A para el modelo de eventos clínicos (tablas `vacunas`, `cirugias`, `tratamientos`, cada una 1:1 con `eventos_clinicos`). Sequelize como ORM, conectado a AWS RDS PostgreSQL (driver `pg`), con esquema gestionado por migraciones versionadas (`sequelize-cli`), no por sincronización automática.

## Justificación
Con solo 3 tipos de evento fijos y conocidos, la normalización es simple y se explica bien en una entrevista técnica con un diagrama ER convencional. Sequelize es una opción de bajo riesgo y bien documentada para PostgreSQL, y las migraciones versionadas evitan el riesgo de alteración o pérdida de datos que introduciría una sincronización automática de esquema en cualquier entorno persistente.

## Consecuencias
- Impacto técnico: `src/models/` mapea 1:1 a las tablas de `docs/data-model.md`; las relaciones se declaran centralizadas en `src/models/index.js`; el esquema se crea y actualiza exclusivamente con `api/src/migrations/` (`npm run migrate`)
- Riesgo asumido: agregar un cuarto tipo de evento clínico en el futuro implica una nueva migración de esquema — aceptable dado que el dominio (vacuna/cirugía/tratamiento) es estable

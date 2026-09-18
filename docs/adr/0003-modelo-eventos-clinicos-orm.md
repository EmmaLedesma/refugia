# ADR-0003: Modelo de eventos clínicos normalizado + Sequelize como ORM

**Estado:** Aceptada — actualizada tras [ADR-0005](0005-migracion-azure-a-aws.md): el motor de base de datos pasó de Azure SQL a **PostgreSQL en AWS RDS**. La decisión de normalización y la elección de Sequelize no cambian (Sequelize soporta el dialecto `postgres` igual de bien que `mssql`); solo cambia el driver (`pg` en vez de `tedious`).

## Contexto
El modelo de datos requiere historia clínica con campos estructurados por tipo de evento (vacuna, cirugía, tratamiento — ver docs/data-model.md). Además, la API (Node/Express) necesita una forma de mapear el modelo relacional a código.

## Alternativas consideradas

**Modelo de eventos clínicos:**
| Alternativa | Ventajas | Trade-offs |
|---|---|---|
| A — Tablas por tipo (elegida) | Normalizado, valida en la base, diagrama ER claro | Nuevo tipo de evento requiere migración |
| B — Columna JSON semiestructurada | Flexible sin migraciones | Sin validación en la base, requiere disciplina en la app |

**ORM:**
| Alternativa | Ventajas | Trade-offs |
|---|---|---|
| Sequelize (elegido) | Soporte maduro y estable para `mssql`/Azure SQL, migraciones, sintaxis de asociaciones directa (hasMany/belongsTo) que mapea 1:1 al diagrama ER ya definido | Menos "moderno" en DX que Prisma |
| Prisma | DX moderna, tipado fuerte | Soporte de SQL Server más reciente/menos probado en producción que en Postgres/MySQL |

## Decisión
Opción A para el modelo de eventos clínicos (tablas `vacunas`, `cirugias`, `tratamientos`, cada una 1:1 con `eventos_clinicos`). Sequelize como ORM, conectado a Azure SQL vía el dialecto `mssql` (driver `tedious`).

## Justificación
Con solo 3 tipos de evento fijos y conocidos, la normalización es simple y se explica bien en una entrevista técnica con un diagrama ER convencional. Sequelize es la opción de menor riesgo para Azure SQL específicamente, evitando pasar tiempo de portfolio depurando compatibilidad de un ORM más nuevo con un motor de base de datos menos común en su ecosistema.

## Consecuencias
- Impacto técnico: `src/models/` mapea 1:1 a las tablas de `docs/data-model.md`; las relaciones se declaran centralizadas en `src/models/index.js`
- Riesgo asumido: agregar un cuarto tipo de evento clínico en el futuro implica una migración de esquema — aceptable dado que el dominio (vacuna/cirugía/tratamiento) es estable
- En desarrollo se usa `sequelize.sync({ alter: true })` por velocidad; antes de cualquier entorno más estable, reemplazar por migraciones versionadas (`sequelize-cli`)

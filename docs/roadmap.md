# Roadmap — fuera del alcance del MVP

Documentado a nivel de negocio/requisitos, no implementado en el MVP técnico.

## Fase 2 (plus del TP)
- **Matching por Machine Learning**: reemplazar/complementar el scoring por reglas con un modelo entrenado. Requiere datos históricos de adopciones reales o, en su defecto, un dataset sintético — en ese caso, declarado explícitamente como demo/simulación, no como validación con datos reales.

## Fuera de alcance (no priorizado)
- Red de hogares de tránsito (postulación, gestión, matching de tránsitos)
- Módulo de padrinos y donaciones (padrinazgo, metas por animal, seguimiento de necesidades)
- Multi-refugio / multi-tenant (requeriría migrar auth a Azure AD B2C — ver ADR-0002)
- Módulo de stock/gastos del refugio
- Notificaciones automatizadas (email/push)

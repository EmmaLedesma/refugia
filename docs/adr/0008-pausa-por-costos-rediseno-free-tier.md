# ADR-0008: Pausa del proyecto por facturación imprevista — rediseño hacia free tier total

**Estado:** Aceptada

## Contexto
Durante el desarrollo activo, llegó una factura de AWS no anticipada. El diseño original (documentado en ADR-0004) apuntaba a mantenerse dentro del free tier, pero **nunca se configuraron alarmas de billing ni un budget con notificaciones** — esa fue la omisión real: el free tier se calculó en el diseño, pero no se monitoreó en producción. Ante esto, se apagaron manualmente los recursos que generaban costo, y se decidió pausar cualquier cambio de infraestructura hasta recibir respuesta de AWS sobre una posible condonación o créditos, dado que el proyecto es de portfolio/académico.

## Decisión
1. El estado del proyecto hasta este punto (infraestructura completa, CI/CD, frontend, fotos, hardening de seguridad) queda congelado como un hito cerrado — documentado y defendible tal cual está, sin más cambios de infraestructura hasta nueva indicación.
2. Antes de reactivar cualquier recurso, se van a agregar **AWS Budgets con alertas** (algo que debió estar desde el ADR-0004 y no estuvo) — un presupuesto mensual bajo con notificación por email al acercarse al límite, no solo al superarlo.
3. El rediseño que sigue prioriza **free tier verificado, no free tier asumido**: revisar cada recurso (RDS, Elastic Beanstalk, CloudFront, S3, NAT/EIP si los hubiera) contra los límites reales y vigentes del free tier de AWS — no contra lo que parecía razonable al momento de diseñar.

## Justificación
Un presupuesto con alertas no es opcional en ningún proyecto real, ni siquiera uno de portfolio sin tráfico — es la diferencia entre un costo visible a tiempo y una sorpresa en el mail. Es una falla de diseño real que vale la pena nombrar así, no suavizarla: el ADR-0004 habló de "diseñado para el free tier" pero nunca cerró el loop con monitoreo activo.

## Consecuencias
- Impacto en el proyecto: pausa temporal, sin pérdida de lo ya construido ni de su valor como evidencia técnica — el código, la documentación y los ADRs siguen siendo un caso de estudio completo
- Impacto de aprendizaje: el control de costos pasa a ser, de acá en más, un requisito no funcional explícito del proyecto (no implícito como antes)
- Próximos pasos, en orden, una vez resuelto el tema de la factura: (1) AWS Budgets con alerta, (2) auditoría de cada recurso contra límites reales de free tier, (3) posible downgrade o eliminación de lo que no entre, documentado recurso por recurso con su trade-off

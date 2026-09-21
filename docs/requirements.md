# Requisitos — Refugia MVP

## Funcionales

### Gestión de animales
- RF1: Registrar un animal (nombre, especie genérica, edad estimada, fecha de ingreso, descripción)
- RF2: Registrar y consultar historia clínica estructurada por tipo de evento (vacuna, cirugía, tratamiento) — implementado: `GET/POST /api/animales/:id/eventos-clinicos`, con UI en `ficha.html`
- RF3: Cambiar estado del animal (disponible / en_tratamiento / en_adopcion / adoptado)
- RF4: Listar y buscar animales por estado/especie
- RF10: Gestionar galería de fotos por animal

### Adopción responsable
- RF5: Cargar cuestionario del adoptante (vivienda, niños, otros animales, tiempo disponible, experiencia previa)
- RF6: Calcular score de compatibilidad animal↔adoptante (0-100) con detalle de qué atributos pesaron
- RF7: Registrar postulación de adopción y su resultado

### Transversal
- RF8: Autenticación del staff del refugio (usuario único definido por configuración, sin tabla de usuarios — ver `docs/adr/0002-auth.md`)
- RF9: Vista pública de solo lectura de animales disponibles (sin login)

## No funcionales
- RNF1: Seguridad — HTTPS, control de acceso por rol, secretos en Key Vault
- RNF2: Disponibilidad de nivel demo/portfolio (no HA productiva) — declarado explícitamente, sin sobre-prometer
- RNF3: Observabilidad — logs y métricas básicas vía Application Insights
- RNF4: Costos — arquitectura dentro de free tier / bajo costo de AWS
- RNF5: Documentación — toda decisión de arquitectura relevante registrada como ADR

## Explícitamente fuera de alcance
Performance a escala, multi-idioma, notificaciones automatizadas, multi-tenant, módulo de tránsitos, módulo de padrinos/donaciones. Ver [roadmap.md](roadmap.md).

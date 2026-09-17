# Modelo de datos — Refugia MVP

## Entidades

**Animal**
`id, nombre, especie, edad_estimada, fecha_ingreso, estado, descripcion`

**Foto**
`id, animal_id (FK), url, orden, es_principal`
Relación 1:N con Animal (galería).

**EventoClinico**
`id, animal_id (FK), tipo (vacuna|cirugia|tratamiento), fecha, veterinario, notas`

Detalle por tipo (normalizado, 1:1 con EventoClinico — ver [ADR sobre este punto pendiente de numerar]):
- **Vacuna**: `evento_id (FK), nombre_vacuna, proxima_dosis`
- **Cirugia**: `evento_id (FK), procedimiento, complicaciones`
- **Tratamiento**: `evento_id (FK), medicamento, dosis, duracion_dias`

**Adoptante**
`id, nombre, contacto, tipo_vivienda, tamaño_espacio_m2, tiene_niños, edades_niños, tiene_otros_animales, tipo_otros_animales, tiempo_disponible_horas_dia, experiencia_previa_mascotas, nivel_actividad_deseado`

**Postulacion**
`id, adoptante_id (FK), animal_id (FK), fecha, score_matching (0-100), detalle_matching, estado (pendiente|aceptada|rechazada)`

## Relaciones
```
Animal 1───N Foto
Animal 1───N EventoClinico ───1 {Vacuna | Cirugia | Tratamiento}
Animal 1───N Postulacion N───1 Adoptante
```

## Nota sobre atributos de matching
Los atributos granulares de Animal (nivel_energia, tamaño, apto_niños, apto_otros_animales) y Adoptante (tiempo_disponible_horas_dia, experiencia_previa_mascotas, nivel_actividad_deseado) están diseñados para servir tanto al scoring por reglas del MVP como a un futuro modelo de Machine Learning (Fase 2, ver roadmap.md) — mismos datos, distinta función de cálculo de `score_matching`.

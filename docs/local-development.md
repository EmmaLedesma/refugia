# Correr Refugia 100% local (sin AWS, costo cero)

Mientras la infraestructura en AWS está pausada (ver [ADR-0008](adr/0008-pausa-por-costos-rediseno-free-tier.md)), todo el proyecto se puede correr en tu computadora, sin tocar ningún servicio de AWS. Es la misma base de código, con Postgres local en vez de RDS.

## 1) Levantar PostgreSQL local con Docker

```bash
docker run --name refugia-local-db \
  -e POSTGRES_USER=refugia_admin \
  -e POSTGRES_PASSWORD=refugia_local \
  -e POSTGRES_DB=refugia \
  -p 5432:5432 \
  -d postgres:16
```

(Si no tenés Docker instalado, es gratis: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/))

## 2) Configurar la API

```bash
cd api
```

Creá `.env` con:
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_NAME=refugia
DB_USER=refugia_admin
DB_PASSWORD=refugia_local
DB_PORT=5432
JWT_SECRET=un-secreto-cualquiera-para-desarrollo-local
JWT_EXPIRES_IN=8h
STAFF_USERNAME=admin
STAFF_PASSWORD_HASH=<generar con el comando de abajo>
```

Generar el hash del password (elegí el que quieras, no necesita ser el mismo que usabas en AWS):
```bash
node -e "console.log(require('bcrypt').hashSync('TuPasswordLocal123', 10))"
```//pegá el resultado en `STAFF_PASSWORD_HASH`.

## 3) Instalar, migrar y sembrar datos

```bash
npm install
npm run migrate
npm run seed      # opcional — carga los animales/adoptantes de ejemplo que ya conocés
npm run dev
```

La API queda escuchando en `http://localhost:3000`.

## 4) Abrir el frontend

El frontend (`web/`) ya está configurado para apuntar a `http://localhost:3000` mientras dure esta pausa. Simplemente abrí `web/index.html` con doble clic.

## Qué funciona y qué no, en este modo

| Funcionalidad | Local |
|---|---|
| Login, animales, adoptantes, postulaciones, matching, historia clínica | ✅ Funciona igual que en AWS |
| Fotos (upload) | ⬜ No funciona — requiere S3 real. La UI no se rompe, solo falla ese paso puntual con un mensaje de error |
| HTTPS, CDN, dominio público | ⬜ No aplica — es local, nadie más lo puede ver salvo que compartas tu pantalla |

## Volver a apuntar a AWS cuando se reactive

En cada archivo de `web/*.html`, buscar la línea `const API_BASE = 'http://localhost:3000';` y reemplazarla por la versión comentada al lado (apunta a CloudFront).

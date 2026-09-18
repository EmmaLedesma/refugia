require('dotenv').config();
const { cargarSecretos } = require('./config/secrets');

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    // Antes de requerir app/models: en producción completa DB_PASSWORD y JWT_SECRET desde SSM
    await cargarSecretos();

    const app = require('./app');
    const { sequelize } = require('./models');

    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');
    // El esquema se crea/actualiza con migraciones (`npm run migrate`), no acá.
    // Ver docs/adr/0003-modelo-eventos-clinicos-orm.md.

    app.listen(PORT, () => {
      console.log(`Refugia API escuchando en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
}

iniciar();

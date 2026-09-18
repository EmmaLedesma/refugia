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

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Modelos sincronizados con la base de datos.');
    }

    app.listen(PORT, () => {
      console.log(`Refugia API escuchando en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
}

iniciar();

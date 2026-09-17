const sequelize = require('../config/database');
const Animal = require('./animal');
const Foto = require('./foto');
const EventoClinico = require('./eventoClinico');
const Vacuna = require('./vacuna');
const Cirugia = require('./cirugia');
const Tratamiento = require('./tratamiento');
const Adoptante = require('./adoptante');
const Postulacion = require('./postulacion');

// Animal 1───N Foto
Animal.hasMany(Foto, { foreignKey: 'animalId', as: 'fotos' });
Foto.belongsTo(Animal, { foreignKey: 'animalId' });

// Animal 1───N EventoClinico
Animal.hasMany(EventoClinico, { foreignKey: 'animalId', as: 'historiaClinica' });
EventoClinico.belongsTo(Animal, { foreignKey: 'animalId' });

// EventoClinico 1───1 {Vacuna | Cirugia | Tratamiento} — Opción A (ADR pendiente de numerar en docs/adr)
EventoClinico.hasOne(Vacuna, { foreignKey: 'eventoId', as: 'detalleVacuna' });
Vacuna.belongsTo(EventoClinico, { foreignKey: 'eventoId' });

EventoClinico.hasOne(Cirugia, { foreignKey: 'eventoId', as: 'detalleCirugia' });
Cirugia.belongsTo(EventoClinico, { foreignKey: 'eventoId' });

EventoClinico.hasOne(Tratamiento, { foreignKey: 'eventoId', as: 'detalleTratamiento' });
Tratamiento.belongsTo(EventoClinico, { foreignKey: 'eventoId' });

// Animal 1───N Postulacion N───1 Adoptante
Animal.hasMany(Postulacion, { foreignKey: 'animalId', as: 'postulaciones' });
Postulacion.belongsTo(Animal, { foreignKey: 'animalId' });

Adoptante.hasMany(Postulacion, { foreignKey: 'adoptanteId', as: 'postulaciones' });
Postulacion.belongsTo(Adoptante, { foreignKey: 'adoptanteId' });

module.exports = {
  sequelize,
  Animal,
  Foto,
  EventoClinico,
  Vacuna,
  Cirugia,
  Tratamiento,
  Adoptante,
  Postulacion,
};

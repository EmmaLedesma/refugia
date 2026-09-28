const { Animal, Foto, EventoClinico, Vacuna, Cirugia, Tratamiento, sequelize } = require('../models');

// RF4: listar y buscar por estado/especie
async function listar(req, res) {
  try {
    const { estado, especie } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (especie) where.especie = especie;

    const animales = await Animal.findAll({
      where,
      include: [{ model: Foto, as: 'fotos' }],
      order: [['fechaIngreso', 'DESC']],
    });
    res.json(animales);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar animales', detalle: err.message });
  }
}

// RF1: registrar un animal
async function crear(req, res) {
  try {
    const animal = await Animal.create(req.body);
    res.status(201).json(animal);
  } catch (err) {
    res.status(400).json({ error: 'Datos inválidos', detalle: err.message });
  }
}

// Detalle de un animal, incluyendo galería e historia clínica (RF2)
async function obtenerPorId(req, res) {
  try {
    const animal = await Animal.findByPk(req.params.id, {
      include: [
        { model: Foto, as: 'fotos' },
        { model: EventoClinico, as: 'historiaClinica' },
      ],
    });
    if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });
    res.json(animal);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el animal', detalle: err.message });
  }
}

// RF3: cambiar estado del animal
async function cambiarEstado(req, res) {
  try {
    const { estado } = req.body;
    const estadosValidos = ['disponible', 'en_tratamiento', 'en_adopcion', 'adoptado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}` });
    }
    const animal = await Animal.findByPk(req.params.id);
    if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });

    animal.estado = estado;
    await animal.save();
    res.json(animal);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el estado', detalle: err.message });
  }
}

// RF2: consultar historia clínica de un animal (público — transparencia para quien evalúa adoptar)
async function listarEventosClinicos(req, res) {
  try {
    const eventos = await EventoClinico.findAll({
      where: { animalId: req.params.id },
      include: [
        { model: Vacuna, as: 'detalleVacuna' },
        { model: Cirugia, as: 'detalleCirugia' },
        { model: Tratamiento, as: 'detalleTratamiento' },
      ],
      order: [['fecha', 'DESC']],
    });
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la historia clínica', detalle: err.message });
  }
}

// RF2: registrar un evento clínico — solo staff
async function crearEventoClinico(req, res) {
  const { tipo, fecha, veterinario, notas, detalle = {} } = req.body;
  const tiposValidos = ['vacuna', 'cirugia', 'tratamiento'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ error: `tipo inválido. Valores permitidos: ${tiposValidos.join(', ')}` });
  }
  if (!fecha) {
    return res.status(400).json({ error: 'fecha es requerida' });
  }

  const animal = await Animal.findByPk(req.params.id);
  if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });

  const t = await sequelize.transaction();
  try {
    const evento = await EventoClinico.create(
      { animalId: animal.id, tipo, fecha, veterinario, notas },
      { transaction: t }
    );

    if (tipo === 'vacuna') {
      await Vacuna.create(
        { eventoId: evento.id, nombreVacuna: detalle.nombreVacuna, proximaDosis: detalle.proximaDosis || null },
        { transaction: t }
      );
    } else if (tipo === 'cirugia') {
      await Cirugia.create(
        { eventoId: evento.id, procedimiento: detalle.procedimiento, complicaciones: detalle.complicaciones || null },
        { transaction: t }
      );
    } else if (tipo === 'tratamiento') {
      await Tratamiento.create(
        {
          eventoId: evento.id,
          medicamento: detalle.medicamento,
          dosis: detalle.dosis || null,
          duracionDias: detalle.duracionDias || null,
        },
        { transaction: t }
      );
    }

    await t.commit();

    const eventoCompleto = await EventoClinico.findByPk(evento.id, {
      include: [
        { model: Vacuna, as: 'detalleVacuna' },
        { model: Cirugia, as: 'detalleCirugia' },
        { model: Tratamiento, as: 'detalleTratamiento' },
      ],
    });
    res.status(201).json(eventoCompleto);
  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: 'No se pudo registrar el evento clínico', detalle: err.message });
  }
}

const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../config/s3');

const TIPOS_PERMITIDOS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const TAMAÑO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB — validado del lado del cliente antes de pedir la URL (ver limitación en ADR-0007)

// RF10 (paso 1): generar una URL presignada — el navegador sube el archivo directo a S3, nunca pasa por este servidor
async function presignFoto(req, res) {
  try {
    const { contentType, tamaño } = req.body;
    const extension = TIPOS_PERMITIDOS[contentType];
    if (!extension) {
      return res.status(400).json({ error: `Tipo de imagen no permitido. Usá: ${Object.keys(TIPOS_PERMITIDOS).join(', ')}` });
    }
    if (tamaño && tamaño > TAMAÑO_MAX_BYTES) {
      return res.status(400).json({ error: `La imagen supera el máximo de ${TAMAÑO_MAX_BYTES / 1024 / 1024}MB` });
    }

    const animal = await Animal.findByPk(req.params.id);
    if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });

    const key = `animales/${animal.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    const comando = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(s3, comando, { expiresIn: 300 }); // 5 minutos para completar el upload

    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'sa-east-1'}.amazonaws.com/${key}`;

    res.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo generar la URL de subida', detalle: err.message });
  }
}

// RF10 (paso 2): una vez que el navegador subió el archivo a S3 con éxito, guardar el registro en la base
async function agregarFoto(req, res) {
  try {
    const { url, esPrincipal } = req.body;
    if (!url) return res.status(400).json({ error: 'url es requerida' });

    const animal = await Animal.findByPk(req.params.id);
    if (!animal) return res.status(404).json({ error: 'Animal no encontrado' });

    if (esPrincipal) {
      await Foto.update({ esPrincipal: false }, { where: { animalId: animal.id } });
    }

    const cantidadActual = await Foto.count({ where: { animalId: animal.id } });
    const foto = await Foto.create({
      animalId: animal.id,
      url,
      esPrincipal: !!esPrincipal || cantidadActual === 0, // la primera foto es principal por defecto
      orden: cantidadActual,
    });

    res.status(201).json(foto);
  } catch (err) {
    res.status(400).json({ error: 'No se pudo agregar la foto', detalle: err.message });
  }
}

module.exports = { listar, crear, obtenerPorId, cambiarEstado, listarEventosClinicos, crearEventoClinico, presignFoto, agregarFoto };

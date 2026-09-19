const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const animalesRouter = require('./routes/animales');
const adoptantesRouter = require('./routes/adoptantes');
const postulacionesRouter = require('./routes/postulaciones');
const authRouter = require('./routes/auth');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/animales', animalesRouter);
app.use('/api/adoptantes', adoptantesRouter);
app.use('/api/postulaciones', postulacionesRouter);

app.use(errorHandler);

module.exports = app;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const usuarioValido = username === process.env.STAFF_USERNAME;
    const passwordValida =
      usuarioValido &&
      process.env.STAFF_PASSWORD_HASH &&
      (await bcrypt.compare(password, process.env.STAFF_PASSWORD_HASH));

    if (!usuarioValido || !passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { username, rol: 'staff' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión', detalle: err.message });
  }
}

module.exports = { login };

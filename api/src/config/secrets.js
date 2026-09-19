const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

const ssm = new SSMClient({ region: process.env.AWS_REGION || 'sa-east-1' });
const prefix = `/${process.env.PROJECT_NAME || 'refugia-dev'}`;

async function obtenerParametro(nombre) {
  const { Parameter } = await ssm.send(
    new GetParameterCommand({ Name: `${prefix}/${nombre}`, WithDecryption: true })
  );
  return Parameter.Value;
}

/**
 * En producción (Elastic Beanstalk), DB_PASSWORD y JWT_SECRET no viajan como
 * variables de entorno en texto plano — se leen de SSM Parameter Store
 * (ver infra/terraform/main.tf, recursos aws_ssm_parameter).
 * En desarrollo local, se toman directo del .env para simplicidad.
 */
async function cargarSecretos() {
  if (process.env.NODE_ENV !== 'production') {
    return; // ya están en process.env vía dotenv
  }
  process.env.DB_PASSWORD = await obtenerParametro('db_password');
  process.env.JWT_SECRET = await obtenerParametro('jwt_secret');
  process.env.STAFF_PASSWORD_HASH = await obtenerParametro('staff_password_hash');
}

module.exports = { cargarSecretos };

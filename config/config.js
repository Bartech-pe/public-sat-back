// config.js
const dotenv = require('dotenv');
dotenv.config();

function getEnv(name, fallback, required = false) {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? fallback;
}

module.exports = {
  development: {
    dialect: getEnv('DB_DIALECT', 'mysql'),
    host: getEnv('DB_HOST', 'localhost'),
    port: parseInt(getEnv('DB_PORT', '3306')),
    username: getEnv('DB_USER', 'root'),
    password: getEnv('DB_PASSWORD', ''),
    database: getEnv('DB_NAME', 'sat_crm_db'),
    dialectOptions: {
      connectTimeout: 200000, // 20 segundos
    },
  },
};

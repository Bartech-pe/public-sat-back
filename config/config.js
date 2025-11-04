// config.js
const dotenv = require('dotenv');
dotenv.config();

function getEnv(name) {
  const value = process.env[name];
  return value;
}

module.exports = {
  development: {
    dialect: getEnv('DB_DIALECT'),
    host: getEnv('DB_HOST_DEV'),
    port: parseInt(getEnv('DB_PORT')),
    username: getEnv('DB_USER_DEV'),
    password: getEnv('DB_PASS_DEV'),
    database: getEnv('DB_NAME_DEV'),
    dialectOptions: {
      connectTimeout: 200000, // 20 segundos
    },
  },
  production: {
    dialect: getEnv('DB_DIALECT'),
    host: getEnv('DB_HOST_PROD'),
    port: parseInt(getEnv('DB_PORT')),
    username: getEnv('DB_USER_PROD'),
    password: getEnv('DB_PASS_PROD'),
    database: getEnv('DB_NAME_PROD'),
    dialectOptions: {
      connectTimeout: 200000, // 20 segundos
    },
  },

  central: {
    dialect: getEnv('CENTRAL_DB_DIALECT'),
    host: getEnv('CENTRAL_DB_HOST'),
    port: parseInt(getEnv('CENTRAL_DB_PORT')),
    username: getEnv('CENTRAL_DB_USER'),
    password: getEnv('CENTRAL_DB_PASS'),
    database: getEnv('CENTRAL_DB_NAME'),
    dialectOptions: {
      connectTimeout: 200000, // 20 segundos
    },
  },
};

import * as dotenv from 'dotenv';
import * as Joi from 'joi';

// Cargar .env
dotenv.config();

// Validación con Joi
const envSchema = Joi.object({
  // # App Environment
  NODE_ENV: Joi.string().valid('development', 'production').required(),
  PORT: Joi.number().default(3000),
  // # DB Config
  DB_DIALECT: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().required(),
  // # JWT Config
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES: Joi.string().required(),
  JWT_ROUNDS: Joi.string().required(),
  // # Multi channel
  BASE_URL_CHANNEL_CONNECTOR: Joi.string().required(),
  // # AMI Config
  AMI_URL: Joi.string().required(),
  AMI_USERNAME: Joi.string().required(),
  AMI_PASSWORD: Joi.string().required(),
  AMI_PORT: Joi.number().required(),
  // # ARI Config
  ARI_USERNAME: Joi.string().required(),
  ARI_PASSWORD: Joi.string().required(),
  // # API VICIdial Config
  VICIDIAL_USER: Joi.string().required(),
  VICIDIAL_PASS: Joi.string().required(),
  // # API SAT Config
  SAT_URL: Joi.string().required(),
  CLIENT_ID: Joi.string().required(),
  CLIENT_SECRET: Joi.string().required(),
  API_SAT_USER: Joi.string().required(),
  API_SAT_PASS: Joi.string().required(),
  API_SAT_REALM: Joi.string().required(),
  API_SAT_GRANT_TYPE: Joi.string().required(),
  SMS_MAS_URL: Joi.string().required(),
  SMS_INV_URL: Joi.string().required(),
  RASA_URL: Joi.string().required(),
  // # CENTRAL DB Config
  CENTRAL_DB_DIALECT: Joi.string().required(),
  CENTRAL_DB_HOST: Joi.string().required(),
  CENTRAL_DB_PORT: Joi.string().required(),
  CENTRAL_DB_USER: Joi.string().required(),
  CENTRAL_DB_PASSWORD: Joi.string().required(),
  CENTRAL_DB_NAME: Joi.string().required(),
  // # API SAT
  API_SAT_URL: Joi.string().required(),
  AUTH_SAT_URL: Joi.string().required(),
  AUTH_CLIENT_ID: Joi.string().required(),
  AUTH_CLIENT_SECRET: Joi.string().required(),
  AUTH_REALM: Joi.string().required(),
  AUTH_GRANT_TYPE: Joi.string().required(),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Error de configuración del entorno: ${error.message}`);
}

export const envConfig = {
  isDev: envVars.NODE_ENV === 'development',
  port: envVars.PORT,
};

export const dbConfig = {
  dialect: envVars.DB_DIALECT,
  host: envVars.DB_HOST,
  port: envVars.DB_PORT,
  user: envVars.DB_USER,
  pass: envVars.DB_PASSWORD,
  name: envVars.DB_NAME,
};

export const jwtConfig = {
  secret: envVars.JWT_SECRET,
  expires: envVars.JWT_EXPIRES,
  rounds: envVars.JWT_ROUNDS,
};

export const channelConnectorConfig = {
  baseUrl: envVars.BASE_URL_CHANNEL_CONNECTOR,
};

export const amiConfig = {
  host: envVars.AMI_URL,
  port: envVars.AMI_PORT,
  user: envVars.AMI_USERNAME,
  pass: envVars.AMI_PASSWORD,
};

export const ariConfig = {
  user: envVars.ARI_USERNAME,
  pass: envVars.ARI_PASSWORD,
};

export const vicidialConfig = {
  user: envVars.VICIDIAL_USER,
  pass: envVars.VICIDIAL_PASS,
};

export const apiSATConfig = {
  url: envVars.SAT_URL,
  clientId: envVars.CLIENT_ID,
  clientSecret: envVars.CLIENT_SECRET,
  user: envVars.API_SAT_USER,
  pass: envVars.API_SAT_PASS,
  realm: envVars.API_SAT_REALM,
  grantType: envVars.API_SAT_GRANT_TYPE,
  smsMasUrl: envVars.SMS_MAS_URL,
  smsInvUrl: envVars.SMS_INV_URL,
  rasaUrl: envVars.RASA_URL,
};

export const centralDBConfig = {
  dialect: envVars.CENTRAL_DB_DIALECT,
  host: envVars.CENTRAL_DB_HOST,
  port: envVars.CENTRAL_DB_PORT,
  user: envVars.CENTRAL_DB_USER,
  pass: envVars.CENTRAL_DB_PASSWORD,
  name: envVars.CENTRAL_DB_NAME,
};

export const apiSatConfig = {
  url: envVars.API_SAT_URL,
  authUrl: envVars.AUTH_SAT_URL,
  authClientId: envVars.AUTH_CLIENT_ID,
  authClientSecret: envVars.AUTH_CLIENT_SECRET,
  authRealm: envVars.AUTH_REALM,
  authGrantType: envVars.AUTH_GRANT_TYPE,
  emailUrl: envVars.URL_API_SAT,
};

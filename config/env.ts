import * as dotenv from 'dotenv';
import * as Joi from 'joi';

// Cargar .env
dotenv.config();

// Validación con Joi
const envSchema = Joi.object({
  // # App Environment
  NODE_ENV: Joi.string().valid('development', 'production').required(),
  PORT: Joi.number().default(3000),
  CRM_URL: Joi.string().required(),
  CRM_API_URL: Joi.string().required(),
  // # DB Config
  DB_DIALECT: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_HOST_DEV: Joi.string().required(),
  DB_HOST_PROD: Joi.string().required(),
  DB_USER_DEV: Joi.string().required(),
  DB_PASS_DEV: Joi.string().allow('').required(),
  DB_USER_PROD: Joi.string().required(),
  DB_PASS_PROD: Joi.string().allow('').required(),
  DB_NAME_DEV: Joi.string().required(),
  DB_NAME_PROD: Joi.string().required(),
  // # JWT Config
  JWT_SECRET: Joi.string().required(),
  JWT_SECRET_CITIZEN: Joi.string().required(),
  JWT_EXPIRES: Joi.string().required(),
  JWT_ROUNDS: Joi.string().required(),
  // # Multi channel
  BASE_URL_CHANNEL_CONNECTOR: Joi.string().required(),
  CHANNEL_CONNECTOR_KEY: Joi.string().required(),
  // # AMI Config
  AMI_URL: Joi.string().required(),
  AMI_USERNAME: Joi.string().required(),
  AMI_PASSWORD: Joi.string().required(),
  AMI_PORT: Joi.number().required(),
  // # ARI Config
  ARI_USERNAME: Joi.string().required(),
  ARI_PASSWORD: Joi.string().required(),
  // # API VICIdial Config
  VICIDIAL_HOST: Joi.string().required(),
  VICIDIAL_PUBLIC_IP: Joi.string().required(),
  VICIDIAL_PRIVATE_IP: Joi.string().required(),
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
  SMS_SAT_URL: Joi.string().required(),
  // # CENTRAL DB Config
  CENTRAL_DB_DIALECT: Joi.string().required(),
  CENTRAL_DB_HOST: Joi.string().required(),
  CENTRAL_DB_PORT: Joi.string().required(),
  CENTRAL_DB_USER: Joi.string().required(),
  CENTRAL_DB_PASS: Joi.string().allow('').required(),
  CENTRAL_DB_NAME: Joi.string().required(),
  // # API SAT
  API_SAT_URL: Joi.string().required(),
  AUTH_SAT_URL: Joi.string().required(),
  AUTH_CLIENT_ID: Joi.string().required(),
  AUTH_CLIENT_SECRET: Joi.string().required(),
  AUTH_REALM: Joi.string().required(),
  AUTH_GRANT_TYPE: Joi.string().required(),

  // # METABASE
  METABASE_SITE_URL: Joi.string().required(),
  METABASE_SECRET_KEY: Joi.string().required(),

  // # AUDIOS
  URL_API_AUDIOS: Joi.string().required(),

  // # Configuración redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
}).unknown();

const { error, value: ev } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Error de configuración del entorno: ${error.message}`);
}

export const envConfig = {
  isDev: ev.NODE_ENV === 'development',
  port: ev.PORT,
  crmUrl: ev.CRM_URL,
  baseUri: ev.CRM_API_URL,
};

export const dbConfig = {
  dialect: ev.DB_DIALECT,
  port: ev.DB_PORT,
  hostDev: ev.DB_HOST_DEV,
  userDev: ev.DB_USER_DEV,
  passDev: ev.DB_PASS_DEV,
  nameDev: ev.DB_NAME_DEV,
  hostProd: ev.DB_HOST_PROD,
  userProd: ev.DB_USER_PROD,
  passProd: ev.DB_PASS_PROD,
  nameProd: ev.DB_NAME_PROD,
};

export const jwtConfig = {
  secret: ev.JWT_SECRET,
  expires: ev.JWT_EXPIRES,
  rounds: ev.JWT_ROUNDS,
  secretCitizen: ev.JWT_SECRET_CITIZEN,
};

export const channelConnectorConfig = {
  baseUrl: ev.BASE_URL_CHANNEL_CONNECTOR,
  verifyToken: ev.CHANNEL_CONNECTOR_KEY,
};

export const amiConfig = {
  host: ev.AMI_URL,
  port: ev.AMI_PORT,
  user: ev.AMI_USERNAME,
  pass: ev.AMI_PASSWORD,
};

export const ariConfig = {
  user: ev.ARI_USERNAME,
  pass: ev.ARI_PASSWORD,
};

export const vicidialConfig = {
  host: ev.VICIDIAL_HOST,
  publicIP: ev.VICIDIAL_PUBLIC_IP,
  privateIP: ev.VICIDIAL_PRIVATE_IP,
  user: ev.VICIDIAL_USER,
  pass: ev.VICIDIAL_PASS,
};

export const satConfig = {
  url: ev.SAT_URL,
  clientId: ev.CLIENT_ID,
  clientSecret: ev.CLIENT_SECRET,
  user: ev.API_SAT_USER,
  pass: ev.API_SAT_PASS,
  realm: ev.API_SAT_REALM,
  grantType: ev.API_SAT_GRANT_TYPE,
  smsMasUrl: ev.SMS_MAS_URL,
  smsInvUrl: ev.SMS_INV_URL,
  rasaUrl: ev.RASA_URL,
  smsUrl: ev.SMS_SAT_URL,
};

export const centralDBConfig = {
  dialect: ev.CENTRAL_DB_DIALECT,
  host: ev.CENTRAL_DB_HOST,
  port: ev.CENTRAL_DB_PORT,
  user: ev.CENTRAL_DB_USER,
  pass: ev.CENTRAL_DB_PASS,
  name: ev.CENTRAL_DB_NAME,
};

export const apiSatConfig = {
  url: ev.API_SAT_URL,
  authUrl: ev.AUTH_SAT_URL,
  authClientId: ev.AUTH_CLIENT_ID,
  authClientSecret: ev.AUTH_CLIENT_SECRET,
  authRealm: ev.AUTH_REALM,
  authGrantType: ev.AUTH_GRANT_TYPE,
  emailUrl: ev.URL_API_SAT,
};

export const metabaseConfig = {
  url: ev.METABASE_SITE_URL,
  secret: ev.METABASE_SECRET_KEY,
};

export const audiobaseConfig = {
  url: ev.URL_API_AUDIOS,
};

export const redisConfig = {
  port: ev.REDIS_PORT,
  host: ev.REDIS_HOST,
};

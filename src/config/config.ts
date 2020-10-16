import Joi from 'joi';
import dotenv from 'dotenv'
import * as path from 'path';
// for more details on how this works please read:
// https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config({ path: path.join(__dirname, '../../.env') })

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    ACCESS_LOG_LEVEL: Joi.string().description('server log level'),
    PORT: Joi.number().default(3000),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
  })
  .unknown();

  
const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

interface emailConfigObject {
  smtp: object
  from: string
 }

interface jwtConfigObject {
  secret: string
  accessExpirationMinutes: number
  refreshExpirationDays: number
  resetPasswordExpirationMinutes: number
}

interface Config {
    env: string
    logLevel: string
    pagination: number
    port: number
    jwt: jwtConfigObject
    email: emailConfigObject
  }
  
export default {
  env: envVars.NODE_ENV || 'development',
  pagination: envVars.PAGINATION || 10,
  logLevel: envVars.ACCESS_LOG_LEVEL || 10,
  port: envVars.PORT || 3000,
  jwt: {
    secret: envVars.SECRET || 'Secret',
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES || 30,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS || 30,
    resetPasswordExpirationMinutes: 10,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
} as Config
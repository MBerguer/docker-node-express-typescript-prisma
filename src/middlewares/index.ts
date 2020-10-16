import express, { Request, Response, NextFunction, Application } from 'express'
import helmet from 'helmet'
// @ts-ignore There is no type definition for this, added under the  types/lib folder
import xss from 'xss-clean'
import compression from 'compression'
import cors from 'cors'
import passport from 'passport'
import config from '../config/config'
import morgan from '../config/morgan'
import jwtStrategy from '../config/passport'
import authLimiter from './rateLimiter'
import { errorConverter, errorHandler } from './error'
import httpStatus from 'http-status'


type JsonError = (
  err: any | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void

type Wrapper = (
  fn: Function
) => (req: Request, res: Response, next: NextFunction) => any

//! wrap every async route handler
//! Passes errors to next function
export const wrap: Wrapper = fn => (...args) => fn(...args).catch(args[2])

//! Handles malformed JSON errors

export const handleJsonError: JsonError = (err, _req, res, next) => {
  if (
    err instanceof SyntaxError &&
    (err as any).status === 400 &&
    'body' in err
  ) {
    return res.status(httpStatus.BAD_REQUEST).json({ err: (err as any).message })
  }
  next()
}

//! Compose middleware here
export const applyMiddleware = (server: Application) => {
  server.use(handleJsonError)

  if (config.env !== 'test') {
    server.use(morgan.successHandler);
    server.use(morgan.errorHandler);
  }

  // set security HTTP headers
  server.use(helmet());

  // parse json request body
  server.use(express.json());

  // parse urlencoded request body
  server.use(express.urlencoded({ extended: true }));

  // sanitize request data
  server.use(xss());

  // gzip compression
  server.use(compression());

  // enable cors
  server.use(cors());
  server.options('*', cors());

  // jwt authentication
  server.use(passport.initialize());
  passport.use('jwt', jwtStrategy);

  // limit repeated failed requests to auth endpoints
  if (config.env === 'production') {
    server.use('/auth', authLimiter);
  }

  // convert error to ApiError, if needed
  server.use(errorConverter);

  // handle error
  server.use(errorHandler);
}

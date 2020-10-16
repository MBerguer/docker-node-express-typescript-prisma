import express from 'express'
import routes from './routes'
import { applyMiddleware } from './middlewares'
import httpStatus from 'http-status'
import ApiError from './utils/apiError'

const app = express()

//! Apply all the middleware stuff
applyMiddleware(app)

//! Setting routes
app.use('/', routes)

//! Send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

export default app;

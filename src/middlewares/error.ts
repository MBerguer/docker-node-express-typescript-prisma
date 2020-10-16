import httpStatus from 'http-status';
import config from '../config/config';
import logger from '../config/logger';
import ApiError from '../utils/apiError';

export const errorConverter = (err:any, req:any, res:any, next:any) => {

  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || statusCode;
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

//! eslint-disable-next-line no-unused-vars
export const errorHandler = (err:any, req:any, res:any, next:any) => {

  let { statusCode, message } = err;
  if (!err.isOperational) {
    statusCode = statusCode || (err.toString().indexOf("Not found")) ?
                                  httpStatus.NOT_FOUND
                                  :httpStatus.INTERNAL_SERVER_ERROR;
    message = message || httpStatus.INTERNAL_SERVER_ERROR;
  }
  

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode ).send(response);
};


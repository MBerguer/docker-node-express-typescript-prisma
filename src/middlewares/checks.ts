import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { UserService } from "../services/user.service";
import * as jwt from 'jsonwebtoken'
import config from '../config/config'

export const checkRole = (rolesParam: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //! Get user role from the database
    try {
      //! Get the user ID from previous midleware
      const id = res.locals.payload.sub;
      const user = await UserService.getUserById(id);
      
      //! Check if array of authorized roles includes the user's role      
      if (user) {       
        if (!rolesParam || rolesParam.indexOf(user.role) > -1){
          next();
        }
        else {
          res.status(httpStatus.UNAUTHORIZED).send();
        }
      };      
    } catch (id) {
      res.status(httpStatus.UNAUTHORIZED).send();
    }   
  };
};


//! Verify incoming token
//! Signs the new token and sets the header
export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const token: string = req.headers.authorization || ''
  let payload: any

  try {
    payload = jwt.verify(token, config.jwt.secret)
    res.locals.payload = payload
  } catch (err) {
    res.status(httpStatus.UNAUTHORIZED).json({ err: 'A valid token is required' })
    return
  }

  const { id } = payload

  const newToken = jwt.sign({ id }, config.jwt.secret, { expiresIn: '1h' })

  res.setHeader('authorization', newToken)

  next()
}
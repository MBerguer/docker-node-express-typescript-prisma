
import { Request, Response } from 'express'
import { wrap } from '../middlewares'
import { UserService } from '../services/user.service'
import { AuthService } from '../services/auth.service'
import { TokenService } from '../services/token.service'
import { EmailService } from '../services/email.service'
import httpStatus from 'http-status'

export const AuthController = {

  //! Register a new user
  register: wrap(async (req: Request, res: Response) => {
      const user = await UserService.createUser(req.body);
      const token = await TokenService.generateAuthTokens(user.id);
      res.status(httpStatus.CREATED).json({ user, payload: token })
  }),

  //! Login as a valid user
  login: wrap(async (req: Request, res: Response) => {
    const { email, username, password } = req.body;
    const user = await AuthService.loginTypeHandler(email, username, password);    
    const token = await TokenService.generateAuthTokens(user.id);
    res.status(httpStatus.OK).json({ user, payload: token })
  }),

  //! logout as a valid user
  logout: wrap(async (req: Request, res: Response) => {
    await AuthService.logout(req.body.refreshToken);
    res.status(httpStatus.NO_CONTENT).send();
  }),

  //! refreshTokens as a valid user
  refreshTokens: wrap(async (req: Request, res: Response) => {
    const token = await AuthService.refreshAuth(req.body.refreshToken);
    res.status(httpStatus.OK).send({ ...token });
  }),

  //! forgotPassword as a valid user
  forgotPassword: wrap(async (req: Request, res: Response) => {
    const resetPasswordToken = await TokenService.generateResetPasswordToken(req.body.email);
    await EmailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
    res.status(httpStatus.NO_CONTENT).send();
  }),

  //! resetPassword as a valid user
  resetPassword: wrap(async (req: Request, res: Response) => {
    const token = req.query.token?.toString();
    if(token) {
      await AuthService.resetPassword(token, req.body.password);
    }
    res.status(httpStatus.NO_CONTENT).send();
  }),

  //! Update password for existing user
  updatePassword: wrap(async (req: Request, res: Response) => {
    const userid= res.locals.payload.id;
    const { oldPassword, newPassword } = req.body
    const user = await AuthService.updatePassword(userid, oldPassword, newPassword);
    const token = await TokenService.generateAuthTokens(user.id);
    res.status(httpStatus.OK).json({ user, payload: token })
    
  }),
}

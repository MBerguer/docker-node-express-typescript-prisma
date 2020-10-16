
import { User } from '@prisma/client'
import { UserService } from '../services/user.service'
import httpStatus from 'http-status'
import * as bcrypt from 'bcryptjs'
import { TokenService } from '../services/token.service'
import ApiError from '../utils/apiError'

export const AuthService = {
 
  //! Login with a valid email
  loginUserWithEmailAndPassword: async (email: string, password: string) => {
    const user = await UserService.getUserByEmail(email)
    if (!user || !(bcrypt.compareSync(password, user.password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }
    return user
  },

  //! Login with a valid username
  loginUserWithYUsernameAndPassword: async (username: string, password: string) => {
    const user = await UserService.getUserByUsername(username)
    if (!user || !(bcrypt.compareSync(password, user.password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect username or password');
    }
    return user
  },

  //! Login both
  loginTypeHandler: async (email: string, username: string, passwordUsed: string) => {
    let loginWith = ''

    if (!(username && passwordUsed)){
      if (!(email && passwordUsed)){
        throw new ApiError(httpStatus.BAD_REQUEST, 'Must provide a valid username or email toghether with a password');
      } else {
        loginWith = 'EMAIL_PROVIDED';
      }
    }else{
      loginWith = 'USERNAME_PROVIDED';
    }

    let user: User | null
    switch (loginWith) {
      case 'EMAIL_PROVIDED':
        user = await UserService.getUserByEmail(email)
        if (!user || !( user && bcrypt.compareSync(passwordUsed, user.password))) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect email or password');
        }
        break;
      case 'USERNAME_PROVIDED':
          user = await UserService.getUserByUsername(username)
          if (!user || !(bcrypt.compareSync(passwordUsed, user.password))) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect username or password');
          }
          break;
      default:
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Login error');
    }

    // To avoid sending the password to the frontend 
    let { password, ...userWithoutPassword } = user;
    
    return ({ ...userWithoutPassword })
  },

  //! logout
  logout: async (refreshToken: string) => {
    const refreshTokenDoc = await TokenService.findToken(refreshToken, 'refresh', false);
    if (!refreshTokenDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    return await TokenService.deleteToken(refreshTokenDoc);
  },

  //! Refresh Auth
  refreshAuth: async (refreshToken: string) => {
    try {
      const refreshTokenDoc = await TokenService.verifyToken(refreshToken, 'refresh');
      const user = await UserService.getUserById(refreshTokenDoc.user);
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not found')
      } else {
        await TokenService.deleteToken(refreshTokenDoc);
        return TokenService.generateAuthTokens(user.id);
      }  
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate')
    }
  },

  //! Reset Password
  resetPassword: async (resetPasswordToken: string, newPassword: string) => {
    try {
      const resetPasswordTokenDoc = await TokenService.verifyToken(resetPasswordToken, 'resetPassword');
      const user = await UserService.getUserById(resetPasswordTokenDoc.user);
      if (!user) {
        throw new Error();
      } else {
        await TokenService.deleteUserToken(user.id, 'resetPassword');
        await UserService.updateUserById(user.id, { password: newPassword });
      }
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
    }
  },

  //! Update Password
  updatePassword: async ( userid: string, oldPassword: string, newPassword: string) => {

    let user: User | null
    
    if (!(oldPassword && newPassword)){
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Must provide old and new passwords')
    }
    user = await UserService.getUserById(userid);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User with that id does not exist')
    } else {
      if (!bcrypt.compareSync(oldPassword, user.password)){
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Password was incorrect')
      }
      if (bcrypt.compareSync(newPassword, user.password)){
        throw new ApiError(httpStatus.UNAUTHORIZED, 'New password must be different')
      }
      const password = bcrypt.hashSync(newPassword, 8)
      await UserService.updateUserById(user.id, { password: password });
    }
   
    let { password, ...userWithoutPassword } = user;
  
    // To avoid sending the password to the frontend
    return userWithoutPassword
  },
}
import httpStatus from 'http-status'
import * as jwt from 'jsonwebtoken'
import config from '../config/config'
import moment from 'moment';
import { PrismaClient, User, TypeTokens, Token } from '@prisma/client';
import { UserService } from '../services/user.service'
import ApiError from '../utils/apiError';

const prisma = new PrismaClient({});

export const TokenService = {

  //! Save a token
  findToken: async (refreshToken:string, type:TypeTokens, blacklisted: Boolean) => {
    const tokenDoc = await prisma.token.findOne({
      //TODO to-do
      where: { token: refreshToken } //blacklisted: blacklisted, type: type
    });
    return tokenDoc;
  },

  //! Save a token
  deleteToken: async (token: Token) => {
    const tokenDoc = await prisma.token.delete({
      where: { ...token }
    });
    return tokenDoc;
  },

  //! Save a token
  deleteUserToken: async (userid: string, type: TypeTokens) => {
    const tokenDoc = await prisma.token.deleteMany({
      where: { user: userid, type: type}
    });
    return tokenDoc;
  },

  //! Generate token
  generateToken: async (userId:string, expires:moment.Moment, secret = config.jwt.secret) => {
    const payload = {
      sub: userId,
      iat: moment().unix(),
      exp: expires.unix(),
    };
    return jwt.sign(payload, secret);
  },

  //! Save a token
  saveToken: async (token:string, userId:string, expires:moment.Moment, type:TypeTokens, blacklisted = false) => {
    const tokenDoc = await prisma.token.create({
      data : {
        token: token,
        user: userId,
        expires: expires.toDate(),
        type: type,
        blacklisted,
      }
    });
    return tokenDoc;
  },

  //! Verify token and return token doc (or throw an error if it is not valid)
  verifyToken: async (token: string, type: TypeTokens) => {
    const payload = jwt.verify(token, config.jwt.secret);
    //TODO to-do
    const tokenDoc = await prisma.token.findOne({ where: {token: token} } ); //user: payload.sub blacklisted: false, type: type
    if (!tokenDoc) {
      throw new Error('Token not found');
    }
    return tokenDoc;
  },

  //! Generate auth tokens
  generateAuthTokens: async (userid: string) => {
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = await TokenService.generateToken(userid, accessTokenExpires);

    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = await TokenService.generateToken(userid, refreshTokenExpires);
    await TokenService.saveToken(refreshToken, userid, refreshTokenExpires, TypeTokens.refresh);

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate(),
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate(),
      },
    };
  },

  //! Generate reset password token
  generateResetPasswordToken: async (email:string) => {
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
    }
    const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    const resetPasswordToken = await TokenService.generateToken(user.id, expires);
    await TokenService.saveToken(resetPasswordToken, user.id, expires, 'resetPassword');
    return resetPasswordToken;
  },

}
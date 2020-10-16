import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { UserService } from '../services/user.service';
import config from './config';

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload:string, done:any) => {
  try {
    const id = payload.sub() //check if is valid
    const user = await UserService.getUserById(id);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

export default jwtStrategy;
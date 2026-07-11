const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { adminRoles, CUSTOMER } = require('./roles');
const { User, Admin } = require('../models');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

/**
 * JWT payload shape:
 * { sub: userId, role: 'customer' | 'superAdmin' | 'storeManager' | 'deliveryManager', type: 'access' }
 */
const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      return done(null, false, { message: 'Invalid token type' });
    }

    let account = null;
    if (adminRoles.includes(payload.role)) {
      account = await Admin.findById(payload.sub);
    } else if (payload.role === CUSTOMER) {
      account = await User.findById(payload.sub);
    }

    if (!account || account.active === false) {
      return done(null, false);
    }

    // attach role explicitly so middleware can use it
    account = account.toObject ? account.toObject({ getters: true }) : account;
    account.role = payload.role;
    return done(null, account);
  } catch (err) {
    return done(err, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = { jwtStrategy };

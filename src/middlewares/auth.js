const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights, adminRoles } = require('../config/roles');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights && requiredRights.length) {
    const userRights = roleRights.get(user.role) || [];
    const hasAll = requiredRights.every((r) => userRights.includes(r));
    if (!hasAll) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }
  resolve();
};

/**
 * `auth('rightA', 'rightB')` — authenticate + check rights
 */
const auth = (...requiredRights) => (req, res, next) =>
  new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(
      req,
      res,
      next
    );
  })
    .then(() => next())
    .catch((err) => next(err));

/**
 * `requireRole('superAdmin', 'storeManager')` — restrict to specific roles.
 * Must be used AFTER auth().
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
  }
  next();
};

/** Shortcut: any admin */
const requireAdmin = requireRole(...adminRoles);

module.exports = auth;
module.exports.auth = auth;
module.exports.requireRole = requireRole;
module.exports.requireAdmin = requireAdmin;

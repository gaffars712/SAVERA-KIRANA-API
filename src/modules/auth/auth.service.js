const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const config = require('../../config/config');
const { tokenTypes } = require('../../config/tokens');
const { CUSTOMER } = require('../../config/roles');
const { User, Admin, OTP } = require('../../models');
const ApiError = require('../../utils/ApiError');
const smsService = require('../../services/sms.service');

/* ─────────────────────── Token helpers ─────────────────────── */

const generateToken = (sub, role, type, expiresMinutes) => {
  const payload = {
    sub,
    role,
    type,
    iat: moment().unix(),
    exp: moment().add(expiresMinutes, 'minutes').unix(),
  };
  return jwt.sign(payload, config.jwt.secret);
};

const issueAuthTokens = (account) => {
  const access = generateToken(
    account._id.toString(),
    account.role,
    tokenTypes.ACCESS,
    config.jwt.accessExpirationMinutes
  );
  const refresh = generateToken(
    account._id.toString(),
    account.role,
    tokenTypes.REFRESH,
    config.jwt.refreshExpirationMinutes
  );
  return {
    access: {
      token: access,
      expires: moment().add(config.jwt.accessExpirationMinutes, 'minutes').toDate(),
    },
    refresh: {
      token: refresh,
      expires: moment().add(config.jwt.refreshExpirationMinutes, 'minutes').toDate(),
    },
  };
};

/* ─────────────────────── Customer OTP flow ─────────────────────── */

const OTP_TTL_MINUTES = 5;

const requestOtp = async (phone) => {
  // 6-digit OTP; in dev printed to console via sms service
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = moment().add(OTP_TTL_MINUTES, 'minutes').toDate();
  const otpHash = await bcrypt.hash(code, 8);

  await OTP.deleteMany({ phone, purpose: 'login' });
  await OTP.create({ phone, otp: otpHash, purpose: 'login', expiresAt });

  await smsService.sendOtp(phone, code);

  return {
    phone,
    expiresInSeconds: OTP_TTL_MINUTES * 60,
    devOtp: config.env === 'development' ? code : undefined,
  };
};

const verifyOtp = async (phone, code, name) => {
  const record = await OTP.findOne({ phone, purpose: 'login' }).sort({ createdAt: -1 });
  if (!record) throw new ApiError(httpStatus.BAD_REQUEST, 'OTP not requested');
  if (record.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: record._id });
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired');
  }
  if (record.attempts >= 5) {
    await OTP.deleteOne({ _id: record._id });
    throw new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Too many attempts, request a new OTP');
  }

  const ok = await bcrypt.compare(String(code), record.otp);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }

  await OTP.deleteOne({ _id: record._id });

  let user = await User.findOne({ phone });
  let isNew = false;
  if (!user) {
    isNew = true;
    user = await User.create({
      phone,
      name: name || '',
      role: CUSTOMER,
      isPhoneVerified: true,
    });
  } else {
    user.isPhoneVerified = true;
    user.lastLoginAt = new Date();
    if (name && !user.name) user.name = name;
    await user.save();
  }

  const tokens = issueAuthTokens({ _id: user._id, role: CUSTOMER });
  return { user, tokens, isNew };
};

/* ─────────────────────── Admin login ─────────────────────── */

const adminLogin = async (email, password) => {
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
  if (!admin || !admin.active) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }
  const ok = await admin.isPasswordMatch(password);
  if (!ok) throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');

  admin.lastLoginAt = new Date();
  await admin.save();

  const tokens = issueAuthTokens({ _id: admin._id, role: admin.role });
  const safe = admin.toObject();
  delete safe.password;
  return { admin: safe, tokens };
};

/* ─────────────────────── Refresh ─────────────────────── */

const refreshTokens = async (refreshToken) => {
  let payload;
  try {
    payload = jwt.verify(refreshToken, config.jwt.secret);
  } catch (e) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }
  if (payload.type !== tokenTypes.REFRESH) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
  }
  return issueAuthTokens({ _id: payload.sub, role: payload.role });
};

module.exports = {
  requestOtp,
  verifyOtp,
  adminLogin,
  refreshTokens,
  issueAuthTokens,
};

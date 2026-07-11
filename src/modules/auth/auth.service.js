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
const firebaseService = require('../../services/firebase.service');
const emailService = require('../../services/email.service');

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
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = moment().add(OTP_TTL_MINUTES, 'minutes').toDate();
  const otpHash = await bcrypt.hash(code, 8);

  await OTP.deleteMany({ phone, purpose: 'login' });
  await OTP.create({ phone, otp: otpHash, purpose: 'login', expiresAt });

  const result = await smsService.sendOtp(phone, code);
  const smsMissing = !!result?.dev;

  return {
    phone,
    expiresInSeconds: OTP_TTL_MINUTES * 60,
    devOtp:
      smsMissing && config.env === 'development' ? code : undefined,
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

/* ─────────────────────── Admin email OTP ─────────────────────── */

const adminRequestEmailOtp = async (email) => {
  const emailLc = email.toLowerCase();
  const admin = await Admin.findOne({ email: emailLc });
  if (!admin) throw new ApiError(httpStatus.UNAUTHORIZED, 'Not an admin email');
  if (!admin.active) throw new ApiError(httpStatus.UNAUTHORIZED, 'Admin account is deactivated');

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = moment().add(OTP_TTL_MINUTES, 'minutes').toDate();
  const otpHash = await bcrypt.hash(code, 8);

  await OTP.deleteMany({ email: emailLc, purpose: 'adminLogin' });
  await OTP.create({ email: emailLc, otp: otpHash, purpose: 'adminLogin', expiresAt });

  const result = await emailService.sendAdminOtp(emailLc, code);
  const smtpMissing = !!result?.dev;
  return {
    email: emailLc,
    expiresInSeconds: OTP_TTL_MINUTES * 60,
    devOtp: smtpMissing && config.env === 'development' ? code : undefined,
  };
};

const adminVerifyEmailOtp = async (email, code) => {
  const emailLc = email.toLowerCase();
  const record = await OTP.findOne({ email: emailLc, purpose: 'adminLogin' }).sort({ createdAt: -1 });
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

  const admin = await Admin.findOne({ email: emailLc });
  if (!admin) throw new ApiError(httpStatus.UNAUTHORIZED, 'Admin no longer exists');
  if (!admin.active) throw new ApiError(httpStatus.UNAUTHORIZED, 'Admin account is deactivated');

  if (!admin.isActivated) {
    admin.isActivated = true;
    admin.activatedAt = new Date();
  }
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

/* ─────────────────── Email OTP flow ─────────────────── */

const requestEmailOtp = async (email) => {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = moment().add(OTP_TTL_MINUTES, 'minutes').toDate();
  const otpHash = await bcrypt.hash(code, 8);
  const emailLc = email.toLowerCase();

  await OTP.deleteMany({ email: emailLc, purpose: 'login' });
  await OTP.create({ email: emailLc, otp: otpHash, purpose: 'login', expiresAt });

  const result = await emailService.sendOtp(emailLc, code);

  // Only expose the OTP in the response when SMTP is NOT configured (dev fallback).
  // When SMTP is real, the code goes ONLY to the customer's inbox.
  const smtpMissing = !!result?.dev;

  return {
    email: emailLc,
    expiresInSeconds: OTP_TTL_MINUTES * 60,
    devOtp:
      smtpMissing && config.env === 'development' ? code : undefined,
  };
};

const verifyEmailOtp = async (email, code, name) => {
  const emailLc = email.toLowerCase();
  const record = await OTP.findOne({ email: emailLc, purpose: 'login' }).sort({ createdAt: -1 });
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

  let user = await User.findOne({ email: emailLc });
  let isNew = false;
  if (!user) {
    isNew = true;
    user = await User.create({
      email: emailLc,
      name: name || '',
      role: CUSTOMER,
      isEmailVerified: true,
    });
  } else {
    user.isEmailVerified = true;
    user.lastLoginAt = new Date();
    if (name && !user.name) user.name = name;
    await user.save();
  }
  const tokens = issueAuthTokens({ _id: user._id, role: CUSTOMER });
  return { user, tokens, isNew };
};

/* ─────────────────── Profile ─────────────────── */

const updateProfile = async (userId, patch) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  if (patch.phone !== undefined && patch.phone !== user.phone) {
    if (patch.phone) {
      const taken = await User.isPhoneTaken(patch.phone, userId);
      if (taken) throw new ApiError(httpStatus.CONFLICT, 'Phone already registered to another account');
    }
    user.phone = patch.phone || undefined;
  }
  if (patch.name !== undefined) user.name = patch.name;

  await user.save();
  return user;
};

/* ─────────────────── Firebase Phone Auth ─────────────────── */

/**
 * Verify a Firebase ID token from the client (customer web/mobile) and
 * create/find our own User by phone, then issue our JWT pair.
 */
const firebasePhoneVerify = async (idToken, name) => {
  if (!firebaseService.isConfigured()) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Firebase Phone Auth is not configured on the server');
  }
  let decoded;
  try {
    decoded = await firebaseService.verifyIdToken(idToken);
  } catch (e) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Firebase token: ' + e.message);
  }

  const phone = decoded.phone_number;
  if (!phone) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Firebase token has no phone_number claim');
  }

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

module.exports = {
  requestOtp,
  verifyOtp,
  requestEmailOtp,
  verifyEmailOtp,
  updateProfile,
  adminLogin,
  adminRequestEmailOtp,
  adminVerifyEmailOtp,
  refreshTokens,
  issueAuthTokens,
  firebasePhoneVerify,
};

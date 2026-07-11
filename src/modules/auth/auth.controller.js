const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const authService = require('./auth.service');

/* ─── Phone OTP (legacy — kept for backwards compat) ─── */
const requestOtp = catchAsync(async (req, res) => {
  const data = await authService.requestOtp(req.body.phone);
  res.status(httpStatus.OK).json({ success: true, message: 'OTP sent', data });
});

const verifyOtp = catchAsync(async (req, res) => {
  const { phone, otp, name } = req.body;
  const result = await authService.verifyOtp(phone, otp, name);
  res.status(httpStatus.OK).json({
    success: true,
    message: result.isNew ? 'Account created' : 'Logged in',
    data: result,
  });
});

/* ─── Email OTP (primary login flow) ─── */
const requestEmailOtp = catchAsync(async (req, res) => {
  const data = await authService.requestEmailOtp(req.body.email);
  res.status(httpStatus.OK).json({ success: true, message: 'OTP sent to email', data });
});

const verifyEmailOtp = catchAsync(async (req, res) => {
  const { email, otp, name } = req.body;
  const result = await authService.verifyEmailOtp(email, otp, name);
  res.status(httpStatus.OK).json({
    success: true,
    message: result.isNew ? 'Account created' : 'Logged in',
    data: result,
  });
});

/* ─── Profile ─── */
const updateProfile = catchAsync(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  res.json({ success: true, data: { user } });
});

/* ─── Admin ─── */
const adminLogin = catchAsync(async (req, res) => {
  const result = await authService.adminLogin(req.body.email, req.body.password);
  res.status(httpStatus.OK).json({ success: true, message: 'Logged in', data: result });
});

const adminRequestEmailOtp = catchAsync(async (req, res) => {
  const data = await authService.adminRequestEmailOtp(req.body.email);
  res.status(httpStatus.OK).json({ success: true, message: 'OTP sent to admin email', data });
});

const adminVerifyEmailOtp = catchAsync(async (req, res) => {
  const result = await authService.adminVerifyEmailOtp(req.body.email, req.body.otp);
  res.status(httpStatus.OK).json({ success: true, message: 'Logged in', data: result });
});

const firebasePhone = catchAsync(async (req, res) => {
  const { idToken, name } = req.body;
  const result = await authService.firebasePhoneVerify(idToken, name);
  res.status(httpStatus.OK).json({
    success: true,
    message: result.isNew ? 'Account created' : 'Logged in',
    data: result,
  });
});

const refresh = catchAsync(async (req, res) => {
  const tokens = await authService.refreshTokens(req.body.refreshToken);
  res.status(httpStatus.OK).json({ success: true, data: { tokens } });
});

const me = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).json({ success: true, data: { user: req.user } });
});

module.exports = {
  requestOtp,
  verifyOtp,
  requestEmailOtp,
  verifyEmailOtp,
  updateProfile,
  adminLogin,
  adminRequestEmailOtp,
  adminVerifyEmailOtp,
  refresh,
  me,
  firebasePhone,
};

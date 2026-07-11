const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const authService = require('./auth.service');

const requestOtp = catchAsync(async (req, res) => {
  const data = await authService.requestOtp(req.body.phone);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'OTP sent',
    data,
  });
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

const adminLogin = catchAsync(async (req, res) => {
  const result = await authService.adminLogin(req.body.email, req.body.password);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Logged in',
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

module.exports = { requestOtp, verifyOtp, adminLogin, refresh, me };

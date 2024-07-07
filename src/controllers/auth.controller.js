

const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const moment = require('moment');
const mongoose = require('mongoose');
const { authService, userService, tokenService } = require('../services');
const { sendResponse } = require('../utils/responseHandler');
const config = require('../config/config');

const register = catchAsync(async (req, res) => {

    try {
        const { email, name, accessRole, phone } = req.body;
        const isEmailTaken = await authService.checkEmail(email)

        if (isEmailTaken) {
            sendResponse(res, httpStatus.BAD_REQUEST, "Email Already taken", null, null);
        }
        let roleOfUser = accessRole ? accessRole : 'user';
        let userObj = {
            email,
            name,
            accessRole: roleOfUser,
            phone,
        };

        const user = await authService.signup(userObj);
        const tokens = await tokenService.generateAuthTokens(user.data);
        res.status(httpStatus.CREATED).send({ user, tokens });
    } catch (error) {
        sendResponse(res, httpStatus.BAD_REQUEST, error.message, null, null);
    }

});

const signup = catchAsync(async (req, res) => {

    try {
        const { email, name, phone, isGoogleUser } = req.body;
        let userObj = {
            email,
            name,
            accessRole: 'user',
            phone,
            isGoogleUser,
            isEmailVerified: isGoogleUser === true ? true : false
        };

        const user = await authService.signup(userObj);
        if (user.code == 200) {
            // let generatedOtp = Math.floor(Math.random() * 9000) + 1000;
            let generatedOtp = 1234;
            const expires = moment().add(5, 'minutes');
            const createOtpdoc = {
                userId: new mongoose.Types.ObjectId(user?.data?.id),
                type: "verifyemail",
                phone: phone,
                otp: generatedOtp,
                expires
            }
            if (isGoogleUser === true) {
                const token = await tokenService.generateAuthTokens(user?.data);
                res.status(httpStatus.CREATED).send({ tokens: token, user: user?.data });
                return
            } else {
                let otpResponse = await authService.sendOtp(createOtpdoc)
                if (!otpResponse.status) {
                    sendResponse(res, httpStatus.UNAUTHORIZED, null, otpResponse.msg);
                    return
                } else {
                    res.status(httpStatus.CREATED).send({ token: otpResponse.data });
                }
            }
        }
        sendResponse(res, httpStatus.BAD_REQUEST, user, null)
    } catch (error) {
        sendResponse(res, httpStatus.BAD_REQUEST, error.message, null)
    }

});




const verifyOtp = catchAsync(async (req, res) => {
    let token = req.body.token;
    let otp = req.body.otp;
    let otpResponse = await authService.verifyOtp(token, otp)
    if (otpResponse.code == 200) {
        const tokens = await tokenService.generateAuthTokens(otpResponse.data);
        sendResponse(res, httpStatus.OK, { user: otpResponse.data, tokens }, null);
    } else if (otpResponse.code == 401) {
        sendResponse(res, httpStatus.UNAUTHORIZED, null, otpResponse.msg);
    } else {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, otpResponse.msg);
    }
})

const verifyLoginOtp = catchAsync(async (req, res) => {
    let token = req.body.token;
    let otp = req.body.otp;
    let otpResponse = await authService.verifyLoginOtp(token, otp)
    if (otpResponse.code == 200) {
        const tokens = await tokenService.generateAuthTokens(otpResponse.data);
        sendResponse(res, httpStatus.OK, { user: otpResponse.data, tokens }, null);

    } else if (otpResponse.code == 404) {
        sendResponse(res, httpStatus.NOT_FOUND, null, otpResponse.msg);
    } else {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, otpResponse.msg);
    }
})

const login = catchAsync(async (req, res) => {
    const { phone } = req.body;

    const user = await authService.loginUserWithPhoneAndOtp(phone);
    if (user.status) {
        sendResponse(res, httpStatus.OK, { token: user.token }, null);
    } else {
        sendResponse(res, httpStatus.FORBIDDEN, null, user.msg);
    }
});
const FaceBookLogin = catchAsync(async (req, res) => {
    const user = await authService.FaceBookLogin(req?.query);
    if (user?.status) {
        sendResponse(res, httpStatus.OK, user?.data, null);
    } else {
        sendResponse(res, httpStatus.FORBIDDEN, null, user.data);
    }
});





const getCurrentUser = catchAsync(async (req, res) => {
    try {
        const { token } = req.body;
        const userRes = await authService.getCurrentUser(token);
        if (userRes.status) {
            res.status(httpStatus.OK).json({
                code: httpStatus.OK,
                status: true,
                data: { userData: userRes.userData, profileData: userRes.profileData }
            });
        } else {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                code: httpStatus.INTERNAL_SERVER_ERROR,
                status: false,
                data: 'something went wrong',
            });
        }
    } catch (err) {
        res.status(httpStatus.BAD_REQUEST).json({
            status: httpStatus.BAD_REQUEST,
            data: err.message,
        });
    }
});

const logout = catchAsync(async (req, res) => {
    await authService.logout(req.body.refreshToken);
    res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
    const tokens = await authService.refreshAuth(req.body.refreshToken);
    res.send({ ...tokens });
});

module.exports = {
    register,
    login,
    logout,
    refreshTokens,
    getCurrentUser,
    signup,
    verifyOtp,
    FaceBookLogin,
    verifyLoginOtp
};

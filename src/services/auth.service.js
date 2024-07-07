const httpStatus = require('http-status');
const tokenService = require('./token.service');
const Token = require('../models/token.model');
const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const mongoose = require('mongoose');
const moment = require('moment');


/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const signup = async (userBody, res) => {
    const { email, phone } = userBody;

    const existingEmailVerified = await User.findOne({ email, active: true, isEmailVerified: true });
    const existingEmail = await User.findOne({ email, active: true });
    const existingPhoneVerified = await User.findOne({ phone, active: true, isEmailVerified: true });
    const existingPhone = await User.findOne({ phone, active: true });

    // Check if email or phone already exists and is verified
    if (existingEmailVerified) {
        return { data: "User already exists with this email address.", status: false, code: 400 };
    }
    if (phone && existingPhoneVerified) {
        return { data: "User already exists with this phone number.", status: false, code: 400 };
    }

    // Check if both email and phone exist and match
    if (existingEmail && existingPhone && existingEmail.email === existingPhone.email && existingEmail.phone === existingPhone.phone) {
        return { data: existingEmail, status: true, code: 200 };
    }

    // Update phone record with new email if phone exists
    if (existingPhone && phone) {
        const updatedUser = await User.findOneAndUpdate({ phone, active: true }, { email });
        return { data: updatedUser, status: true, code: 200 };
    }

    // Create new user if no conflicts found
    const newUser = await User.create(userBody);
    return { data: newUser, status: true, code: 200 };
};




/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithPhoneAndOtp = async (phone) => {
    let user = await User.findOne({ phone, active: true });
    if (!user) {
        return { user: null, msg: 'Invalid Signin credentials. Please try again.' };
    } else if (user && !(user.accessRole == 'user')) {
        return { user: null, msg: 'User is not authorized' };
    } else {
        // let generatedOtp = Math.floor(Math.random() * 9000) + 1000;
        let generatedOtp = 1234;
        const expires = moment().add(5, 'minutes');
        const createOtpdoc = {
            userId: new mongoose.Types.ObjectId(user?.id),
            type: tokenTypes.LOGIN_VERIFY,
            phone: phone,
            otp: generatedOtp,
            expires
        }
        let otpResponse = await sendOtp(createOtpdoc)
        if (!otpResponse.status) {
            sendResponse(res, httpStatus.UNAUTHORIZED, null, otpResponse.msg);
            return
        } else {
            return { token: otpResponse.data, code: httpStatus.OK, status: true };
        }
    }
};
const FaceBookLogin = async (query) => {
    const { user, isFacebookUser } = query
    const existingEmailVerified = await User.findOne({ email: user, active: true, isEmailVerified: true, isFacebookUser: isFacebookUser });
    if (existingEmailVerified) {
        const token = await tokenService.generateAuthTokens(existingEmailVerified);
        const data = {
            user: existingEmailVerified,
            tokens: token
        }
        return { data: data, status: true, code: 200 };
    }else{
        return {data:'user not found', status : false,code:400}
    }
    // if (phone && existingPhoneVerified) {
    //     return { data: "User already exists with this phone number.", status: false, code: 400 };
    // }
};


/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
    const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
    if (!refreshTokenDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    await refreshTokenDoc.removeToken();

};



/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
    try {
        const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
        const user = await User.findById(refreshTokenDoc.user);
        if (!user) {
            throw new Error();
        }
        await refreshTokenDoc.removeToken();
        return tokenService.generateAuthTokens(user);
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
};


/**
 * getCurrentUser
 * @param {string} token
 * @returns {Promise}
 */
const getCurrentUser = async (token) => {
    try {
        const { user } = await tokenService.verifyToken(token, 'refresh');
        const userData = await User.findOne({ _id: mongoose.Types.ObjectId(user), active: true });
        return { userData, status: true, statusCode: 200 };
    } catch (error) {
        // throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'getCurrentUser failed');
        return { userData: null, profileData: null, isError: 'getCurrentUser failed', status: false, statusCode: 500 }
    }
};

//check Email already exists
const checkEmail = async (email) => {
    return await User.findOne({ email: email });
};



const sendOtp = async (otpDoc) => {
    const specificPhone = otpDoc.phone;
    const tenMinutesAgo = new Date(Date.now() - (10 * 60 * 1000));

    try {
        const result = await OTP.aggregate([
            {
                $match: {
                    phone: specificPhone,
                    createdAt: { $gte: tenMinutesAgo },
                },
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                },
            },
        ]);
        if (result.length > 0 && result[0].count > 2) {
            return {
                msg: "You have reached the maximum number of resend attempts. Please try after some time.",
                status: false,
                code: 400,
            };
        } else {
            const otpResponse = await OTP.create(otpDoc);
            if (otpResponse) {
                const token = await tokenService.generateToken(otpDoc.userId, otpDoc.expires, otpDoc.type);
                return { data: token, status: true, statusCode: 200 };
            } else {
                return {
                    msg: "Error in creating OTP. Please try again.",
                    status: false,
                    code: 500,
                };
            }
        }
    } catch (error) {
        return {
            msg: "An error occurred while processing your request. Please try again later.",
            status: false,
            code: 500,
            error: error.message,
        };
    }
};

const verifyOtp = async (token, otp) => {
    try {
        const currentDate = new Date()
        const isTokenExpired = tokenService.isTokenExpired(token)
        if (isTokenExpired == true) {
            return { msg: "OTP has expired. Please request a new one", status: false, code: 401 };
        }
        const tokenResponse = await tokenService.verifyOtpToken(token);
        const tokenUser = await OTP.findOne({ userId: new mongoose.Types.ObjectId(tokenResponse?._id), type: "verifyemail" }).sort({ _id: -1 }) || null;
        if (tokenUser) {
            if (otp == tokenUser.otp) {
                if (currentDate > tokenUser.expires) {
                    return { msg: "OTP has expired. Please request a new one", status: false, code: 401 };
                }
                let filterQuery = { _id: new mongoose.Types.ObjectId(tokenResponse?._id), active: true }
                const updatedResult = await User.findOneAndUpdate(filterQuery, { isEmailVerified: true })
                if (updatedResult) {
                    await OTP.deleteMany({ userId: new mongoose.Types.ObjectId(tokenResponse?._id), type: "verifyemail" });
                    const user = await User.findOne({ _id: new mongoose.Types.ObjectId(tokenResponse?._id), active: true })
                    // return { data: "Email is Verified. You can proceed to login.", status: true, code: 200 };
                    return { data: user, status: true, code: 200 };

                }

            } else {
                return { msg: "Invalid OTP", status: false, code: 403 };
            }
        } else {
            return { msg: "No OTP found for this Phone Number", status: false, code: 403 };

        }

    } catch (error) {
        console.log(error);
        return { msg: `Something went Wrong`, code: 500, status: false }
    }
}

const verifyLoginOtp = async (token, otp) => {
    try {
        const currentDate = new Date()
        const isTokenExpired = tokenService.isTokenExpired(token)
        if (isTokenExpired == true) {
            return { msg: "OTP has expired. Please request a new one", status: false, code: 401 };
        }
        const tokenResponse = await tokenService.verifyOtpToken(token);
        const tokenUser = await OTP.findOne({ userId: new mongoose.Types.ObjectId(tokenResponse?._id), type: tokenTypes.LOGIN_VERIFY }).sort({ _id: -1 }) || null;
        if (tokenUser) {
            if (otp == tokenUser.otp) {
                if (currentDate > tokenUser.expires) {
                    return { msg: "OTP has expired. Please request a new one", status: false, code: 404 };
                }
                let filterQuery = { _id: new mongoose.Types.ObjectId(tokenResponse?._id), active: true }
                const updatedResult = await User.findOneAndUpdate(filterQuery, { isEmailVerified: true })
                if (updatedResult) {
                    await OTP.deleteMany({ userId: new mongoose.Types.ObjectId(tokenResponse?._id), type: tokenTypes.LOGIN_VERIFY });
                    const user = await User.findOne({ _id: new mongoose.Types.ObjectId(tokenResponse?._id), active: true })
                    return { data: user, status: true, code: 200 };
                }

            } else {
                return { msg: "Invalid OTP", status: false, code: 404 };
            }
        } else {
            return { msg: "No OTP found for this Phone Number", status: false, code: 404 };

        }

    } catch (error) {
        console.log(error);
        return { msg: `Something went Wrong`, code: 500, status: false }
    }
}
module.exports = {
    loginUserWithPhoneAndOtp,
    logout,
    refreshAuth,
    getCurrentUser,
    signup,
    checkEmail,
    sendOtp,
    verifyOtp,
    verifyLoginOtp,
    FaceBookLogin
};

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const { User } = require('../models'); // Adjust the path to your User model
const { google } = require('googleapis');
const { tokenService } = require('../services');
const config = require('../config/config');

const CLIENT_ID = config?.googleAuth?.CLIENT_ID;
const CLIENT_SECRET = config?.googleAuth?.CLIENT_SECRET;
const REDIRECT_URI = config?.googleAuth?.REDIRECT_URI; // Ensure this matches your Google Cloud Console setting
const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Step 1: Redirect to Google OAuth2.0
const googleAuth = (req, res) => {
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email'],
    });
    res.redirect(url);
};

// Step 2: Handle Google OAuth2.0 callback
const googleCallBack = async (req, res) => {
    const { code } = req.query;
    try {
        // Exchange authorization code for access token
        const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Fetch user info from Google
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });

        const { email, name } = response.data;

        // Check if user with email already exists and is verified
        const existingUser = await User.findOne({ email, active: true, isEmailVerified: true });

        if (existingUser) {
            const token = await tokenService.generateAuthTokens(existingUser);
            res.status(400).json({
                user: existingUser,
                tokens: token,
                message: 'User already exists with this email address.',
            });
            return;
        }
        // Create a new user if not exists
        const newUser = await User.create({
            email,
            active: true,
            isEmailVerified: true,
            isGoogleUser: true,
            name,
        });

        // Return success response with user and session token
        const token = await tokenService.generateAuthTokens(newUser);
        res.status(201).json({
            user: newUser,
            tokens: token,
            token: 'your-session-token', // Replace with your actual session token generation
        });
    } catch (error) {
        console.error('Error in OAuth2 callback:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
};
module.exports = { googleAuth, googleCallBack }

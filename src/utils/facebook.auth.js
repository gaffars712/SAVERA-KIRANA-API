const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const { User } = require('../models'); // Adjust the path to your User model
const config = require('../config/config'); // Adjust the path to your config

const initFacebookStrategy = () => {
  passport.use(new FacebookStrategy({
    clientID: config.facebookAuth.CLIENT_ID,
    clientSecret: config.facebookAuth.CLIENT_SECRET,
    callbackURL: `${config.facebookAuth.REDIRECT_URI}/v1/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name'] // Adjust profile fields as needed
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const { email, first_name, last_name } = profile._json;
      const name = `${first_name} ${last_name}`;

      // Check if user with email already exists and is verified
      let user = await User.findOne({ email, active: true, isEmailVerified: true });

      if (user) {
        return done(null, user);
      }

      // Create a new user if not exists
      user = new User({
        email,
        name,
        active: true,
        isEmailVerified: true,
        isFacebookUser: true,
      });
      await user.save();

      return done(null, user);
    } catch (err) {
      return done(err, false, { message: 'Authentication failed' });
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

initFacebookStrategy(); // Call it here to initialize the strategy when the file is imported

const authenticateFacebook = () => passport.authenticate('facebook', { scope: ['email'] });

const handleFacebookCallback = () => (req, res, next) => {
  console.log('req', req)
  passport.authenticate('facebook', async (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication failed' });
    }
    if (!user) {
      return res.status(400).json({ message: 'User not authenticated' });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email: user.email, active: true, isEmailVerified: true });
    if (existingUser) {
      return res.redirect(`${config.REMOTE_BASE_URL}?user=${existingUser?.email}&isFacebookUser=true`);
      // return res.status(400).json({
      //   message: 'User already exists',
      //   user: existingUser,
      //   token: 'your-session-token', // Generate your actual session token here
      // });
    }
    // If user is newly created, return success response
    // return res.status(201).json({
    //   message: 'User created successfully',
    //   user,
    //   token: 'your-session-token', // Generate your actual session token here
    // });
    return res.redirect(`${config.REMOTE_BASE_URL}?user=${user?.email}&isFacebookUser=true`);

  })(req, res, next);
};

module.exports = {
  authenticateFacebook,
  handleFacebookCallback,
  passport
};

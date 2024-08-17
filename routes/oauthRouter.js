const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const router = express.Router();

// Passport configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // Handle successful authentication here
    // Store user information in your database or session
    done(null, profile);
}));

// Middleware for authentication
router.use(passport.initialize());
router.use(passport.session());

// Redirect to Google OAuth endpoint
router.get('/auth/google', passport.authenticate('google'));

// Handle callback from Google
router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/', // Redirect to home page on success
    failureRedirect: '/login' // Redirect to login page on failure
}));

module.exports = router;

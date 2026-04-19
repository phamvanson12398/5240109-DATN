import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/userModel.js';

export const configurePassport = () => {
    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
        callbackURL: "/api/v1/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ 
                $or: [
                    { googleId: profile.id },
                    { email: profile.emails[0].value }
                ]
            });

            if (!user) {
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    avatar: {
                        public_id: "social_avatar",
                        url: profile.photos[0].value
                    },
                    password: Math.random().toString(36).slice(-10) // Mật khẩu ngẫu nhiên cho tài khoản social
                });
            } else if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    // Facebook Strategy
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID || 'placeholder',
        clientSecret: process.env.FACEBOOK_APP_SECRET || 'placeholder',
        callbackURL: "/api/v1/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ 
                $or: [
                    { facebookId: profile.id },
                    { email: profile.emails?.[0].value }
                ]
            });

            if (!user) {
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails?.[0].value || `${profile.id}@facebook.com`,
                    facebookId: profile.id,
                    avatar: {
                        public_id: "social_avatar",
                        url: profile.photos?.[0].value
                    },
                    password: Math.random().toString(36).slice(-10)
                });
            } else if (!user.facebookId) {
                user.facebookId = profile.id;
                await user.save();
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

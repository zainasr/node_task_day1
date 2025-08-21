import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import { AuthService } from '../services/auth.service';
import { OAuthProfileInput } from '../schemas/auth.schema';

export const configurePassport = (authService: AuthService) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Email not provided by Google'), false);
          }

          const oauthProfile: OAuthProfileInput = {
            email,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
            provider: 'google',
            providerId: profile.id,
          };

          // ✅ ONLY find/create user here
          const user = await authService.findOrCreateUser(oauthProfile);
          console.log('OAuth User Created/Found:', user);

          // ✅ User is now attached to req.user automatically
          return done(null, user);
        } catch (error) {
          console.error('OAuth Error:', error);
          return done(error as Error, false);
        }
      }
    )
  );
};

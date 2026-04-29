import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { loginUser, getUserById } from "../services/authService.js";

export function configurePassport() {
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const result = await loginUser({ email, password });
          done(null, result);
        } catch (err) {
          done(null, false, { message: err.message });
        }
      }
    )
  );

  return passport;
}

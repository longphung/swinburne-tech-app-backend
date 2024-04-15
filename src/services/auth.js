import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import mailer from "#src/mailer.js";
import User from "#models/users.js";

passport.use(
  new LocalStrategy({}, async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: "No user found" });
      }
      const isValidPassword = await user.checkPassword(password);
      if (!(isValidPassword)) {
        return done(null, false, { message: "Password is incorrect" });
      }
      return done(null, user);
    } catch (e) {
      done(e);
    }
  }),
);

/**
 *
 * @param {{
 *   email: string,
 *   password: string,
 *   role: string,
 *   name: string,
 *   address: string,
 *   phone: string,
 * }} userData
 * @returns {Promise<void>}
 */
export const signUp = async (userData) => {
  // Save the user to the database
  const user = new User({
    username: userData.email,
    password: userData.password,
    role: userData.role,
    name: userData.name,
    address: userData.address,
    phone: userData.phone,
    email: userData.email,
  });
  await user.save();
  // Send a welcome email to the user
  await mailer.sendMail({
    from: process.env.SMTP_USER,
    to: userData.email,
    subject: "Welcome to TechAway",
    html: "<h1>Welcome to TechAway</h1>",
  });
};

export const issueToken = ()

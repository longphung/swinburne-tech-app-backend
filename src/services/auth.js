import passport from "passport";
import * as jose from "jose";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as BearerStrategy } from "passport-http-bearer";

import mailer from "#src/mailer.js";
import User from "#models/users.js";
import { APP_ISSUER } from "#src/globals.js";
import mongoose from "mongoose";

const secret = new TextEncoder().encode(process.env.SECRET_KEY);

passport.use(
  new LocalStrategy({}, async (username, password, done) => {
    try {
      /**
       * @type {User}
       */
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: "No user found" });
      }
      const isValidPassword = await user.checkPassword(password);
      if (!isValidPassword) {
        return done(null, false, { message: "Password is incorrect" });
      }
      return done(null, user);
    } catch (e) {
      done(e);
    }
  }),
);

passport.use(
  new BearerStrategy({}, async (token, done) => {
    try {
      const { payload } = await jose.jwtVerify(token, secret, {
        issuer: APP_ISSUER,
      });
      // const user
      console.log("payload", payload);
    } catch (e) {
      done(e);
    }
  }),
);

/**
 * Process user signup:
 * - Save user to db
 * - Generate confirmation email and url
 * - Send confirmation email
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
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

    // Generate a unique token for the user
    const token = await new jose.SignJWT({ userId: user._id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(APP_ISSUER)
      .setExpirationTime("1h")
      .sign(secret);

    // Create a confirmation URL
    const url = new global.URL("/auth/confirm", process.env.APP_URL);
    url.searchParams.append("token", token);

    // Send a welcome email to the user
    await mailer.sendMail({
      from: process.env.SMTP_USER,
      to: userData.email,
      subject: "Welcome to TechAway",
      html: `<h1>Welcome to TechAway</h1><p>Please confirm your email by clicking on the following link: <a href="${url.toString()}">Confirm Email</a></p>`,
    });

    await session.commitTransaction();

    return user;
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    await session.endSession();
  }
};

export const confirmEmail = async (token) => {
  const { userId } = await jose.jwtVerify(token, secret, {
    issuer: APP_ISSUER,
  });
  const user = await User.findByIdAndUpdate(userId, { emailVerified: true });
  if (!user) {
    throw new Error("User not found");
  }
};

/**
 * Issue ID Token, Access Token and Refresh Token
 * @param {User} userData
 */
export const issueToken = async (userData) => {
  const { _id, password: _p, ...restUserData } = userData;

  const idToken = await new jose.SignJWT({ userData: restUserData })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(APP_ISSUER)
    .setExpirationTime("2h")
    .sign(secret);

  const accessToken = await new jose.SignJWT({
    userId: _id,
    role: userData.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(APP_ISSUER)
    .setExpirationTime("2h")
    .sign(secret);

  const refreshToken = await new jose.SignJWT({
    userId: _id,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(APP_ISSUER)
    .setExpirationTime("14d")
    .sign(secret);
  // TODO: consider encrypting the access and refresh token
  return { idToken, accessToken, refreshToken };
};

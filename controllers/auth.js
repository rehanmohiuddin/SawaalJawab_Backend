const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendErrorResponse } = require("../config/apiUtil.js");
const { generateAuthJwt } = require("../config/jwt.js");
const { mailer } = require("../config/mailer");
const { User } = require("../models/User");

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user && user.confirmed)
      res.status(400).send({
        message: "User Already Exists",
      });
    else if (user && !user.confirmed) {
      //send email again
      const user = await User.findOne({ email: email });
      const token = await generateAuthJwt(
        {
          _id: user._id,
          firstName: user.firstName,
          email: user.email,
        },
        "300s"
      );
      const url =
        process.env.VERIFY_URL + "?token=" + token.token.split(" ")[1];
      await mailer(firstName, url, email);
      res.status(200).send({
        message: "We Have Sent Verification Link To Your Email Please Check",
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
      });
      await newUser.save();
      const token = await generateAuthJwt({
        _id: newUser._id,
        firstName,
        email,
      });
      const url =
        process.env.VERIFY_URL + "?token=" + token.token.split(" ")[1];
      await mailer(firstName, url, email);
      res.status(200).send({
        message: "Please Check Your Email",
      });
    }
  } catch (e) {
    res.status(500).send({
      error: e.toString(),
    });
  }
};

const verify = async (req, res) => {
  try {
    const { token } = req.query;
    const user = jwt.verify(token, process.env.AUTH_SECRET);
    const userExists = await User.findOne({ email: user.email });
    if (userExists && !userExists.confirmed) {
      const updatedUser = {
        ...(
          await User.findOneAndUpdate(
            { email: user.email },
            { confirmed: true },
            { new: true }
          )
        )._doc,
      };
      delete updatedUser.password;
      res.send({
        message: updatedUser,
      });
    } else {
      res.status(500).send({
        message: "Already Verified",
      });
    }
  } catch (e) {
    res.status(500).send({
      error: e.toString(),
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const loginPromise = new Promise(async (resolve, reject) => {
      const user = await User.findOne({ email: email });
      if (user) {
        const decodePassword = await bcrypt.compare(password, user.password);
        resolve({ user, decodePassword });
      } else reject("User Not Found");
    });
    const validUser = async (user) => {
      const token = await generateAuthJwt({
        _id: user._id,
        firstName: user.firstName,
        email: user.email,
      });
      res.status(200).send({
        message: {
          user,
          token: token.token.split(" ")[1],
        },
      });
    };
    loginPromise
      .then(({ user, decodePassword }) =>
        decodePassword
          ? validUser(user, decodePassword)
          : sendErrorResponse(res, "Invalid Password", 403)
      )
      .catch((e) => sendErrorResponse(res, e, 404));
  } catch (e) {
    sendErrorResponse(res, e);
  }
};

const verifyJwt = async (req, res, next) => {
  try {
    const headerRawToken = req.headers.authorization;
    !headerRawToken && sendErrorResponse(res, "No Token Provided", 404);
    if (headerRawToken) {
      const token = headerRawToken.split(" ")[1];
      const verify = await jwt.verify(token, process.env.AUTH_SECRET);
      !verify && sendErrorResponse(res, "Invalid Token", 403);
      next();
    }
  } catch (e) {
    sendErrorResponse(res, e);
  }
};

module.exports = { register, verify, login, verifyJwt };

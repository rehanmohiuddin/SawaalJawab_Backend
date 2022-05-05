const jwt = require("jsonwebtoken");

const generateAuthJwt = async (user, expiry = "2d") => {
  try {
    const expire = expiry;
    const payload = {
      uid: user._id,
      name: user.name,
      email: user.email,
      iat: Date.now(),
    };
    const signedToken = await jwt.sign(payload, process.env.AUTH_SECRET, {
      expiresIn: expire,
    });
    return {
      token: "Bearer " + signedToken,
      expiresIn: expire,
    };
  } catch (error) {
    return error;
  }
};

module.exports = {
  generateAuthJwt,
};

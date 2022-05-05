const express = require("express");
const { register, verify, login, verifyJwt } = require("../controllers/auth");
const router = express.Router();

router.post("/register", register);
router.post("/verify", verify);
router.post("/login", login);

module.exports = router;

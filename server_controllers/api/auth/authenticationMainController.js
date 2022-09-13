const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();

const logInController = require("./logInController");
const signUpController = require("./signUpController");

// route: /api/auth/login
router.use("/login", logInController);
// route: /api/auth/sign-up
router.use("/sign-up", signUpController);


module.exports = router;
const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();

const logInController = require("./logInController");
const signUpController = require("./signUpController");
const unauthorizedController = require("./unauthorizedController");
const logOutController = require("./logOutController");

// route: /api/auth/login
router.use("/login", logInController);
// route: /api/auth/sign-up
router.use("/sign-up", signUpController);
// route: /api/auth/unauthorized
router.use("/unauthorized", unauthorizedController);
// route: /api/auth/logout
router.use("/logout", logOutController);


module.exports = router;
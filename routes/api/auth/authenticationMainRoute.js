const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();

const logInRoute = require("./logInRoute");
const signUpRoute = require("./signUpRoute");
const unauthorizedRoute = require("./unauthorizedRoute");
const logOutRoute = require("./logOutRoute");

// route: /api/auth/login
router.use("/login", logInRoute);
// route: /api/auth/sign-up
router.use("/sign-up", signUpRoute);
// route: /api/auth/unauthorized
router.use("/unauthorized", unauthorizedRoute);
// route: /api/auth/logout
router.use("/logout", logOutRoute);


module.exports = router;
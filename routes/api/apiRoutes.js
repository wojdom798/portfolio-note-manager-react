const path = require("path");
const express = require("express");
const router = express.Router();

const __projectDir = path.join(__dirname, "../../");

const notesMainRoute = require("./notes/notesMainRoute");
const categoriesMainRoute = require("./categories/categoriesMainRoute");
const tagsMainRoute = require("./tags/tagsMainRoute");
const authRoute = require("./auth/authenticationMainRoute");

router.use("/notes", notesMainRoute);
router.use("/categories", categoriesMainRoute);
router.use("/tags", tagsMainRoute);
router.use("/auth", authRoute);

module.exports = router;
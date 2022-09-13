const path = require("path");
const express = require("express");
const router = express.Router();

const __projectDir = path.join(__dirname, "../../");

const notesMainController = require("./notes/notesMainController");
const categoriesMainController = require("./categories/categoriesMainController");
const tagsMainController = require("./tags/tagsMainController");
const authController = require("./auth/authenticationMainController");

router.use("/notes", notesMainController);
router.use("/categories", categoriesMainController);
router.use("/tags", tagsMainController);
router.use("/auth", authController);

module.exports = router;
const path = require("path");
const express = require("express");
const router = express.Router();

const __projectDir = path.join(__dirname, "../../");

const notesMainController = require("./notes/notesMainController");
const categoriesMainController = require("./categories/categoriesMainController");

router.use("/notes", notesMainController);
router.use("/categories", categoriesMainController);

module.exports = router;
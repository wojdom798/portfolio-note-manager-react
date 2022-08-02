const path = require("path");
const express = require("express");
const router = express.Router();

const __projectDir = path.join(__dirname, "../../");

const notesMainController = require("./notes/notesMainController");

router.use("/notes", notesMainController);

module.exports = router;
const express = require("express");
const router = express.Router();

const getNotesController = require("./getNotesController");
const addNoteController = require("./addNoteController");

// route: /api/notes/get
router.use("/get", getNotesController);
// route: /api/notes/add
router.use("/add", addNoteController);

module.exports = router;
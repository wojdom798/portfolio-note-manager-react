const express = require("express");
const router = express.Router();

const getNotesController = require("./getNotesController");
const addNoteController = require("./addNoteController");
const deleteNoteController = require("./deleteNoteController");
const editNoteController = require("./editNoteController");

// route: /api/notes/get
router.use("/get", getNotesController);
// route: /api/notes/add
router.use("/add", addNoteController);
// route: /api/notes/delete
router.use("/delete", deleteNoteController);
// route: /api/notes/edit
router.use("/edit", editNoteController);

module.exports = router;
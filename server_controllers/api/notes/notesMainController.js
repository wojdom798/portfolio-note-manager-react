const express = require("express");
const router = express.Router();

const getNotesController = require("./getNotesController");
const addNoteController = require("./addNoteController");
const deleteNoteController = require("./deleteNoteController");
const editNoteController = require("./editNoteController");
const addTagToNote = require("./addTagToNote");
const removeTagFromNote = require("./removeTagFromNote");

// route: /api/notes/get
router.use("/get", getNotesController);
// route: /api/notes/add
router.use("/add", addNoteController);
// route: /api/notes/delete/:id
router.use("/delete", deleteNoteController);
// route: /api/notes/edit
router.use("/edit", editNoteController);
// route: /api/notes/add-tag-to-note/:noteId/:tagId
router.use("/add-tag-to-note", addTagToNote);
// route: /api/notes/remove-tag-from-note/:noteId/:tagId
router.use("/remove-tag-from-note", removeTagFromNote);

module.exports = router;
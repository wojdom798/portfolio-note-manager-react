const express = require("express");
const router = express.Router();

const getNotesRoute = require("./getNotesRoute");
const addNoteRoute = require("./addNoteRoute");
const deleteNoteRoute = require("./deleteNoteRoute");
const editNoteRoute = require("./editNoteRoute");
const addTagToNoteRoute = require("./addTagToNoteRoute");
const removeTagFromNoteRoute = require("./removeTagFromNoteRoute");

// route: /api/notes/get
router.use("/get", getNotesRoute);
// route: /api/notes/add
router.use("/add", addNoteRoute);
// route: /api/notes/delete/:id
router.use("/delete", deleteNoteRoute);
// route: /api/notes/edit
router.use("/edit", editNoteRoute);
// route: /api/notes/add-tag-to-note/:noteId/:tagId
router.use("/add-tag-to-note", addTagToNoteRoute);
// route: /api/notes/remove-tag-from-note/:noteId/:tagId
router.use("/remove-tag-from-note", removeTagFromNoteRoute);

module.exports = router;
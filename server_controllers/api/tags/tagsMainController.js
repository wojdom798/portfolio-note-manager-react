const express = require("express");
const router = express.Router();

const getTagsController = require("./getTagsController");
const addTagController = require("./addTagController");
const deleteTagController = require("./deleteTagController");
const editTagController = require("./editTagController");

// route: /api/tags/get
router.use("/get", getTagsController);
// route: /api/tags/add
router.use("/add", addTagController);
// route: /api/tags/delete
router.use("/delete", deleteTagController);
// route: /api/tags/edit
router.use("/edit", editTagController);

module.exports = router;
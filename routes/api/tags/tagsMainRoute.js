const express = require("express");
const router = express.Router();

const getTagsRoute = require("./getTagsRoute");
const addTagRoute = require("./addTagRoute");
const deleteTagRoute = require("./deleteTagRoute");
const editTagRoute = require("./editTagRoute");

// route: /api/tags/get
router.use("/get", getTagsRoute);
// route: /api/tags/add
router.use("/add", addTagRoute);
// route: /api/tags/delete
router.use("/delete", deleteTagRoute);
// route: /api/tags/edit
router.use("/edit", editTagRoute);

module.exports = router;
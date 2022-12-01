const path = require("path");
const express = require("express");
const router = express.Router();

const __projectDir = path.join(__dirname, "../../");

const notesMainRoute = require("./notes/notesMainRoute");
const categoriesMainRoute = require("./categories/categoriesMainRoute");
const tagsMainRoute = require("./tags/tagsMainRoute");
const authRoute = require("./auth/authenticationMainRoute");
const getDateRangeRoute = require("./getDateRangeRoute");
const isUsernameAvailableRoute = require("./isUsernameAvailableRoute");
const isCategoryAvailableRoute = require("./isCategoryAvailableRoute");
const isTagAvailableRoute = require("./isTagAvailableRoute");

router.use("/notes", notesMainRoute);
router.use("/categories", categoriesMainRoute);
router.use("/tags", tagsMainRoute);
router.use("/auth", authRoute);
router.use("/get-date-range", getDateRangeRoute);
router.use("/is-username-available", isUsernameAvailableRoute);
router.use("/is-category-available", isCategoryAvailableRoute);
router.use("/is-tag-available", isTagAvailableRoute);

module.exports = router;
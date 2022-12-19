const express = require("express");
const router = express.Router();

const getCategoriesRoute = require("./getCategoriesRoute");
const addCategoryRoute = require("./addCategoryRoute");
const deleteCategoryRoute = require("./deleteCategoryRoute");
const editCategoryRoute = require("./editCategoryRoute");

// route: /api/categories/get
router.use("/get", getCategoriesRoute);
// route: /api/categories/add
router.use("/add", addCategoryRoute);
// route: /api/categories/delete/:id
router.use("/delete", deleteCategoryRoute);
// route: /api/categories/edit
router.use("/edit", editCategoryRoute);

module.exports = router;
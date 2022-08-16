const express = require("express");
const router = express.Router();

const getCategoriesController = require("./getCategoriesController");
const addCategoryController = require("./addCategoryController");
const deleteCategoryController = require("./deleteCategoryController");
const editCategoryController = require("./editCategoryController");

// route: /api/categories/get
router.use("/get", getCategoriesController);
// route: /api/categories/add
router.use("/add", addCategoryController);
// route: /api/categories/delete
router.use("/delete", deleteCategoryController);
// route: /api/categories/edit
router.use("/edit", editCategoryController);

module.exports = router;
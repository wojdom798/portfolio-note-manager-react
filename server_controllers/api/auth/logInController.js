const fs = require("fs");
const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3");
const sqliteOpen = require("sqlite").open;
const router = express.Router();

const __projectDir = path.join(__dirname, "../../../");
const projectSettingsFileName = "project_settings.json";
const settingsFilePath = path.join(__projectDir, projectSettingsFileName);
const projectSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));

const passport = require("passport");

// route: /api/auth/login
router.post("/",
passport.authenticate("local", { failureRedirect: "/api/auth/unauthorized", failureMessage: false }),
async function (req, res, next)
{
    let currentTime = new Date().toLocaleString("pl-PL",{ hour12: false });
    console.log(`[${req.method}] (${currentTime}) ${req.originalUrl}`);

    res.json({
        responseMsg: `Successfully authenticated ${req.body.username}`,
        username: req.user.username
    });
});

module.exports = router;
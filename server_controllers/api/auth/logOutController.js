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

// route: /api/auth/logout
router.post("/",
async function (req, res, next)
{
    let currentTime = new Date().toLocaleString("pl-PL",{ hour12: false });
    console.log(`[${req.method}] (${currentTime}) ${req.originalUrl}`);

    let username = "";
    if (req.hasOwnProperty("user"))
        username = req.user.username;
    console.log(`logging out - ${username}`);

    req.logOut(function (err)
    {
        if (err)
        {
            res.json({
                responseMsg: err.message,
            });
        }
        else
        {
            res.json({
                responseMsg: `Successfully logged out user ${username}`,
                username: username
            });
        }
    });
});

module.exports = router;
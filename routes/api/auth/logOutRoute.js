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

async function logOutRoute(req, res, next)
{
    let username = "";
    if (req.hasOwnProperty("user"))
        username = req.user.username;
    // console.log(`logging out - ${username}`);

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
                username: username,
                isUserLoggedOut: true
            });
        }
    });
}

// route: /api/auth/logout
router.post("/", logOutRoute),
router.get("/", logOutRoute),

module.exports = router;
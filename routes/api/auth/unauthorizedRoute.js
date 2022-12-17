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

// route: /api/auth/unauthorized
router.get("/", unauthorizedMiddleware);
router.post("/", unauthorizedMiddleware);

async function unauthorizedMiddleware(req, res, next)
{
    // console.log("\x1b[37m", "\x1b[43m", "request = ", "\x1b[40m");
    // console.log(req)

    // console.log("\x1b[37m", "\x1b[45m", "response = ", "\x1b[40m");
    // console.log(res)
    

    res.status(401);
    res.json({
        responseData: {
            responseMsg: "User unauthorized",
            isAuthorized: false
        }
    });
}

module.exports = router;
const fs = require("fs");
const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3");
const sqliteOpen = require("sqlite").open;
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const crypto = require("crypto");

const __projectDir = path.join(__dirname, "../../../");
const projectSettingsFileName = "project_settings.json";
const settingsFilePath = path.join(__projectDir, projectSettingsFileName);
const projectSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));


// route: /api/auth/sign-up
router.post("/",
async function (req, res, next)
{
    let currentTime = new Date().toLocaleString("pl-PL",{ hour12: false });
    console.log(`[${req.method}] (${currentTime}) ${req.originalUrl}`);

    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 32, "sha256", async function(err, hashedPswd)
    {
        if (err)
        {
            res.status(404);
            res.json({
                responseMsg: error.message,
            });
        }

        try
        {
            sqlite3.verbose();
            const databaseHandle = await createDbConnection(
                path.join(__projectDir, projectSettings.database.filename));
            await databaseHandle.run(
                "INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)",
                [req.body.username, hashedPswd, salt]
            );
            let user =
            {
                id: this.lastID,
                username: req.body.username
            }
            res.status(200);
            res.json({
                responseMsg: `Added User: id=${user.id}, ${user.username}`,
            });
        }
        catch (error)
        {
            // return next(error);
            res.status(404);
            res.json({
                responseMsg: error.message,
            });
        }
    });
});


function createDbConnection(filename)
{
    return sqliteOpen({
        filename: filename,
        driver: sqlite3.Database
    });
}

module.exports = router;
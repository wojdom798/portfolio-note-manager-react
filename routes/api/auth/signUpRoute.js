const fs = require("fs");
const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3");
const sqliteOpen = require("sqlite").open;
const createSqliteConnection = require("../../server_helper").createSqliteConnection;

const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const crypto = require("crypto");

const __projectDir = path.join(__dirname, "../../../");
const projectSettingsFileName = "project_settings.json";
const settingsFilePath = path.join(__projectDir, projectSettingsFileName);
const projectSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));

const { Pool, Client } = require("pg");
const postgresPool = new Pool(projectSettings.database.postgresql);

// route: /api/auth/sign-up
router.post("/",
async function (req, res, next)
{
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 32, "sha256", async function(err, hashedPswd)
    {
        if (projectSettings.database.selected_database === "sqlite")
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
                const databaseHandle = await createSqliteConnection(
                    path.join(__projectDir, projectSettings.database.sqlite.filename)
                );
                await databaseHandle.run(
                    "INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)",
                    [req.body.username, hashedPswd, salt]
                );
                let user =
                {
                    id: this.lastID,
                    username: req.body.username
                }
                res.status(200).json({
                    responseMsg: `Added User: id=${user.id}, ${user.username}`,
                });
            }
            catch (error)
            {
                // return next(error);
                res.status(404).json({
                    responseMsg: error.message,
                });
            }
        }
        else if (projectSettings.database.selected_database === "postgresql")
        {
            if (err)
            {
                res.status(404).json({
                    responseMsg: error.message,
                });
            }

            try
            {
                let postgresQuery = "INSERT INTO users (username, hashed_password, salt) VALUES ($1, $2, $3) RETURNING id;"
                let postgresQueryValues = [req.body.username, hashedPswd, salt];
                let lastId = (await postgresPool.query(postgresQuery, postgresQueryValues)).rows[0].id;

                let user =
                {
                    id: lastId,
                    username: req.body.username
                }
                res.status(200).json({
                    responseMsg: `Added User: id=${user.id}, ${user.username}`,
                });
            }
            catch (error)
            {
                // return next(error);
                res.status(404).json({
                    responseMsg: error.message,
                });
            }
        }
    });
});

module.exports = router;
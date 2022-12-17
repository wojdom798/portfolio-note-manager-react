const fs = require("fs");
const path = require("path");
const express = require("express");
// const sqlite3 = require("sqlite3").verbose();
const sqlite3 = require("sqlite3");
const sqliteOpen = require("sqlite").open; // allows async/await calls
const router = express.Router();

const __projectDir = path.join(__dirname, "../../../");
const projectSettingsFileName = "project_settings.json";
const settingsFilePath = path.join(__projectDir, projectSettingsFileName);
const projectSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));

const passport = require("passport");

const { Pool, Client } = require("pg");
const postgresPool = new Pool(projectSettings.database.postgresql);

// route: /api/tags/get
router.get("/",
async function (req, res)
{
    let queryArray = [];
    let query = "";
    let queryResult;

    let userId = req.session.passport.user.id;
    // let userId = 1;

    if (projectSettings.database.selected_database === "sqlite")
    {
        try
        {
            sqlite3.verbose();
            const databaseHandle = await createDbConnection(
                path.join(__projectDir, projectSettings.database.sqlite.filename));
            
            queryArray = 
            [
                `SELECT * FROM tag `,
                `WHERE user_id = ${req.session.passport.user.id} `,
                `ORDER BY id ASC;`,
            ];
            for (let line of queryArray)
            {
                query += line;
            }

            queryResult = await databaseHandle.all(query);
            await databaseHandle.close();

            res.json({  
                responseMsg: "Success",
                responseData: {
                    tags: queryResult
                }
            });
        }
        catch (error)
        {
            console.error(error);
            res.status(404);
            // res.send("<h1>404</h1>");
            res.json({
                responseMsg: "An error occured during the querying of data.",
                errorMsg: error.message
            });
        }
    }
    else if (projectSettings.database.selected_database === "postgresql")
    {
        try
        {
            queryArray = 
            [
                `SELECT *, TO_CHAR(date_added, 'YYYY-MM-DD HH24:MI:SS') AS date_added `,
                `FROM tag `,
                `WHERE user_id = ${userId} `,
                `ORDER BY id ASC;`,
            ];
            for (let line of queryArray)
            {
                query += line;
            }

            queryResult = (await postgresPool.query(query)).rows;

            res.json({  
                responseMsg: "Success",
                responseData: {
                    tags: queryResult
                }
            });
        }
        catch (error)
        {
            console.error(error);
            res.status(404);
            // res.send("<h1>404</h1>");
            res.json({
                responseMsg: "An error occured during the querying of data.",
                errorMsg: error.message
            });
        }
    }
}); // end route


function createDbConnection(filename)
{
    return sqliteOpen({
        filename: filename,
        driver: sqlite3.Database
    });
}

module.exports = router;
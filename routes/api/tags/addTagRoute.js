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

// helper functions
const h = require(path.join(__projectDir, "routes", "server_helper.js"));

const { Pool, Client } = require("pg");
const postgresPool = new Pool(projectSettings.database.postgresql);

// route: /api/tags/add
router.post("/",
async function (req, res)
{
    let currentTime = new Date().toLocaleString("pl-PL",{ hour12: false });
    console.log(`[${req.method}] (${currentTime}) ${req.originalUrl}`);

    let queryArray = [];
    let query = "";
    let queryResult;
    let queryValues;

    if (projectSettings.database.selected_database === "sqlite")
    {
        try
        {
            sqlite3.verbose();
            const databaseHandle = await createDbConnection(
                path.join(__projectDir, projectSettings.database.filename));
            
            queryArray = 
            [
                `INSERT INTO tag (name, date_added, user_id) `,
                `VALUES ( `,
                    `'${h.sanitizeText(req.body.newTag.name)}', `,
                    `'${h.sanitizeText(req.body.newTag.date_added)}', `,
                    `${req.session.passport.user.id}); `,
                `SELECT last_insert_rowid();`
            ];
            for (let line of queryArray)
            {
                query += line;
            }

            queryResult = await databaseHandle.run(query);
            await databaseHandle.close();

            res.json({
                responseMsg: "Success",
                responseData: {
                    id: queryResult.lastID
                }
            });
        
        }
        catch (error)
        {
            console.error(error);
            res.status(404);
            // res.send("<h1>404</h1><p>Something went wrong.</p>");
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
            query = "INSERT INTO tag (name, date_added, user_id) VALUES ($1, $2, $3) RETURNING id;";
            queryValues = [req.body.newTag.name, req.body.newTag.date_added, req.session.passport.user.id];

            queryResult = (await postgresPool.query(query, queryValues)).rows[0];

            res.json({
                responseMsg: "Success",
                responseData: {
                    id: queryResult.id
                }
            });
        
        }
        catch (error)
        {
            console.error(error);
            res.status(404);
            // res.send("<h1>404</h1><p>Something went wrong.</p>");
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
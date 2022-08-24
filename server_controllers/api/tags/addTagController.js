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
const h = require(path.join(__projectDir, "server_controllers", "server_helper.js"));

// route: /api/tags/add
router.post("/",
async function (req, res)
{
    let currentTime = new Date().toLocaleString("pl-PL",{ hour12: false });
    console.log(`[${req.method}] (${currentTime}) ${req.originalUrl}`);

    let queryArray = [];
    let query = "";
    let queryResult;

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
                `${req.body.newTag.user_id}); `,
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
}); // end route


function createDbConnection(filename)
{
    return sqliteOpen({
        filename: filename,
        driver: sqlite3.Database
    });
}

module.exports = router;
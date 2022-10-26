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

const { Pool, Client } = require("pg");
const postgresPool = new Pool(projectSettings.database.postgresql);

// route: /api/notes/add-tag-to-note/:noteId/:tagId
router.put("/:noteId/:tagId",
async function (req, res)
{
    let currentTime = new Date().toLocaleString("pl-PL",{ hour12: false });
    console.log(`[${req.method}] (${currentTime}) ${req.originalUrl}`);

    let queryArray = [];
    let query = "";
    let queryResult;
    let queryValues;

    let userId = req.session.passport.user.id;

    const noteId = req.params.noteId;
    const tagId = req.params.tagId;

    if (projectSettings.database.selected_database === "sqlite")
    {
        try
        {
            sqlite3.verbose();
            const databaseHandle = await createDbConnection(
                path.join(__projectDir, projectSettings.database.filename));
            
            queryArray = 
            [
                `INSERT INTO note_tag (note_id, tag_id) `,
                `VALUES ( `,
                    `'${noteId}', `,
                    `'${tagId}'); `,
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
                    queryResult: queryResult
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
            query = "INSERT INTO note_tag (note_id, tag_id) VALUES ($1, $2);";
            queryValues = [noteId, tagId];

            queryResult = (await postgresPool.query(query, queryValues)).rows[0];

            res.json({
                responseMsg: "Success",
                responseData: {
                    queryResult: queryResult
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
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

// route: /api/notes/remove-tag-from-note/:noteId/:tagId
router.put("/:noteId/:tagId",
async function (req, res)
{
    let currentTime = new Date().toLocaleString("pl-PL",{ hour12: false });
    console.log(`[${req.method}] (${currentTime}) ${req.originalUrl}`);

    let queryArray = [];
    let query = "";
    let queryResult;

    const noteId = req.params.noteId;
    const tagId = req.params.tagId;

    try
    {
        sqlite3.verbose();
        const databaseHandle = await createDbConnection(
            path.join(__projectDir, projectSettings.database.filename));
        
        queryArray = 
        [
            `DELETE FROM note_tag WHERE (note_id = ${noteId} AND tag_id = ${tagId});`
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
}); // end route


function createDbConnection(filename)
{
    return sqliteOpen({
        filename: filename,
        driver: sqlite3.Database
    });
}

module.exports = router;
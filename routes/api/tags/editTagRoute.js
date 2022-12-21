const fs = require("fs");
const path = require("path");
const express = require("express");
// const sqlite3 = require("sqlite3").verbose();
const sqlite3 = require("sqlite3");
const sqliteOpen = require("sqlite").open; // allows for async/await calls
const createSqliteConnection = require("../../server_helper").createSqliteConnection;
const router = express.Router();

const __projectDir = path.join(__dirname, "../../../");
const projectSettingsFileName = "project_settings.json";
const settingsFilePath = path.join(__projectDir, projectSettingsFileName);
const projectSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));

// helper functions
const h = require(path.join(__projectDir, "routes", "server_helper.js"));

const { Pool, Client } = require("pg");
const postgresPool = new Pool(projectSettings.database.postgresql);

// route: /api/tags/edit
router.put("/",
async function (req, res)
{
    let query = "";
    let queryResult;
    let queryValues;

    let userId = req.session.passport.user.id;

    const tagToEdit = req.body.tagToEdit;

    if (projectSettings.database.selected_database === "sqlite")
    {
        try
        {
            sqlite3.verbose();
            const databaseHandle = await createSqliteConnection(
                path.join(__projectDir, projectSettings.database.sqlite.filename)
            );

            query = "UPDATE tag SET name = ?, date_added = ? WHERE user_id = ? AND id = ?;";
            queryValues = [
                tagToEdit.name,
                tagToEdit.date_added,
                userId,
                tagToEdit.id
            ];

            queryResult = await databaseHandle.run(query, queryValues);
            lastID = queryResult.lastID;

            await databaseHandle.close();

            res.json({  
                responseMsg: "Success",
                responseData: {
                    updatedTagId: tagToEdit.id
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
            query = "UPDATE tag SET name = $1, date_added = $2 WHERE user_id = $3 AND id = $4;";
            queryValues = [tagToEdit.name, tagToEdit.date_added, userId, tagToEdit.id];

            queryResult = (await postgresPool.query(query, queryValues)).rows[0];

            res.json({  
                responseMsg: "Success",
                responseData: {
                    updatedTagId: tagToEdit.id
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

module.exports = router;
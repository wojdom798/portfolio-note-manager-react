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

// route: /api/notes/edit
router.put("/",
async function (req, res)
{
    let queryTable = [];
    let query = "";
    let queryResult;
    let queryValues;

    let userId = req.session.passport.user.id;

    // console.log(req.body);
    const noteToEdit = req.body.noteToEdit;

    if (projectSettings.database.selected_database === "sqlite")
    {
        try
        {
            sqlite3.verbose();
            const databaseHandle = await createSqliteConnection(
                path.join(__projectDir, projectSettings.database.sqlite.filename)
            );

            queryTable = 
            [
                `UPDATE note `,
                `SET `,
                `title = '${h.sanitizeText(noteToEdit.title)}', `,
                `contents = '${h.sanitizeText(noteToEdit.contents)}', `,
                `date_added = '${noteToEdit.date_added}', `,
                `category_id = ${noteToEdit.category_id}, `,
                `user_id = ${req.session.passport.user.id} `,
                `WHERE id = ${noteToEdit.id};`
            ];
            for (let line of queryTable)
            {
                query += line;
            }
            queryResult = await databaseHandle.run(query);
            lastID = queryResult.lastID;

            await databaseHandle.close();

            res.json({  
                responseMsg: "Success",
                responseData: {
                    updatedNoteId: noteToEdit.id
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
            query = "UPDATE note SET title = $1, contents = $2, date_added = $3, category_id = $4 WHERE user_id = $5 AND id = $6;";
            queryValues = [
                noteToEdit.title, noteToEdit.contents,
                noteToEdit.date_added, noteToEdit.category_id,
                userId, noteToEdit.id
            ];

            queryResult = (await postgresPool.query(query, queryValues)).rows[0];

            res.json({  
                responseMsg: "Success",
                responseData: {
                    updatedNoteId: noteToEdit.id
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
const fs = require("fs");
const path = require("path");
const express = require("express");
// const sqlite3 = require("sqlite3").verbose();
const sqlite3 = require("sqlite3");
const sqliteOpen = require("sqlite").open; // allows async/await calls
const createSqliteConnection = require("../../server_helper").createSqliteConnection;
const router = express.Router();

const __projectDir = path.join(__dirname, "../../../");
const projectSettingsFileName = "project_settings.json";
const settingsFilePath = path.join(__projectDir, projectSettingsFileName);
const projectSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));

const { Pool, Client } = require("pg");
const postgresPool = new Pool(projectSettings.database.postgresql);

// route: /api/notes/delete/:id
router.delete("/:id",
async function (req, res)
{
    let queryArray = [];
    let query = "";
    let queryResult;
    let queryValues;

    let userId = req.session.passport.user.id;

    if (projectSettings.database.selected_database === "sqlite")
    {
        try
        {
            sqlite3.verbose();
            const databaseHandle = await createSqliteConnection(
                path.join(__projectDir, projectSettings.database.sqlite.filename)
            );
            
            queryArray = 
            [
                `DELETE FROM note WHERE `,
                `(user_id = ${req.session.passport.user.id}) AND `,
                `(id = ${req.params.id}); `,
            ];
            for (let line of queryArray)
            {
                query += line;
            }

            queryResult = await databaseHandle.all(query);
            await databaseHandle.close();

            // console.log(queryResult);

            res.json({  
                responseMsg: "Success",
                responseData: {
                    deletedId: queryResult
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
            query = "DELETE FROM note WHERE (user_id = $1) AND (id = $2) RETURNING id;";
            queryValues = [userId, req.params.id];

            queryResult = (await postgresPool.query(query, queryValues)).rows[0];

            res.json({  
                responseMsg: "Success",
                responseData: {
                    deletedId: queryResult.id
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

module.exports = router;
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

const helper = require("../../server_helper");

// route: /api/tags/delete
router.delete("/:id",
async function (req, res)
{
    let queryArray = [];
    let query = "";
    let queryResult;
    let queryValues;

    let userId = req.session.passport.user.id;

    const tagIdsToDelete = JSON.parse(req.params.id);
    let sqlTagIdCondition = ""; // this string will be attached to WHERE clause

    if (projectSettings.database.selected_database === "sqlite")
    {
        try
        {
            sqlite3.verbose();
            const databaseHandle = await createDbConnection(
                path.join(__projectDir, projectSettings.database.filename));

            if (!Array.isArray(tagIdsToDelete))
            {
                sqlTagIdCondition = helper.generateSQLMultiORCondition(
                    1, "id", "sqlite"
                );
            }
            else
            {
                sqlTagIdCondition = helper.generateSQLMultiORCondition(
                    tagIdsToDelete.length, "id",  "sqlite"
                );
            }

            query =
                "DELETE FROM tag" +
                " WHERE (user_id = ?) AND " +
                `${sqlTagIdCondition};`;
            
            if (Array.isArray(tagIdsToDelete))
                queryValues = [userId, ...tagIdsToDelete];
            else
                queryValues = [userId, tagIdsToDelete];

            queryResult = await databaseHandle.all(query);
            await databaseHandle.close();

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
            // query = "DELETE FROM tag WHERE (user_id = $1) AND (id = $2) RETURNING id;";
            // queryValues = [userId, req.params.id];

            if (!Array.isArray(tagIdsToDelete))
            {
                sqlTagIdCondition = helper.generateSQLMultiORCondition(
                    1, "id", "postgres"
                );
            }
            else
            {
                sqlTagIdCondition = helper.generateSQLMultiORCondition(
                    tagIdsToDelete.length, "id",  "postgres"
                );
            }

            query =
                "DELETE FROM tag" +
                " WHERE (user_id = $1) AND " +
                `${sqlTagIdCondition} RETURNING id;`;
            
            if (Array.isArray(tagIdsToDelete))
                queryValues = [userId, ...tagIdsToDelete];
            else
                queryValues = [userId, tagIdsToDelete];

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


function createDbConnection(filename)
{
    return sqliteOpen({
        filename: filename,
        driver: sqlite3.Database
    });
}

module.exports = router;
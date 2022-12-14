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

// route: /api/categories/delete
router.delete("/:id",
async function (req, res)
{
    let queryArray = [];
    let query = "";
    let queryResult;
    let queryValues;

    let userId = req.session.passport.user.id;

    let param = JSON.parse(req.params.id);
    // console.log(param);
    // console.log(param[0]);

    let sqlCategoryIdCondition = "";
    if (!Array.isArray(param))
    {
        sqlCategoryIdCondition = `(id = ${param})`;
    }
    else
    {
        sqlCategoryIdCondition = "(";
        param.forEach((id, index) =>
        {
            if (index !== param.length-1)
                sqlCategoryIdCondition += `(id = ${id}) OR `;
            else
                sqlCategoryIdCondition += `(id = ${id})`;
        });
        sqlCategoryIdCondition += ")";
    }
    

    // res.json({
    //     msg: "test completed",
    //     data: req.params.id,
    //     isArray: Array.isArray(param),
    //     sqlCond: sqlCategoryIdCondition
    // });

    if (projectSettings.database.selected_database === "sqlite")
    {
        try
        {
            sqlite3.verbose();
            const databaseHandle = await createSqliteConnection(
                path.join(__projectDir, projectSettings.database.sqlite.filename)
            );
            
            // queryArray = 
            // [
            //     `DELETE FROM category WHERE `,
            //     `(user_id = ${req.session.passport.user.id}) AND `,
            //     `(id = ${req.params.id});`,
            // ];
            // for (let line of queryArray)
            // {
            //     query += line;
            // }

            query =
                "DELETE FROM category WHERE " +
                `(user_id = ${req.session.passport.user.id}) AND ` +
                sqlCategoryIdCondition + ";";

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
            // query = "DELETE FROM category WHERE (user_id = $1) AND (id = $2) RETURNING id;";
            // queryValues = [userId, req.params.id];
            query =
                "DELETE FROM category" +
                " WHERE (user_id = $1) AND " +
                `${sqlCategoryIdCondition} RETURNING id;`;
            queryValues = [userId];

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
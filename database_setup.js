const fs = require("fs");
const readline = require("readline");
const path = require("path");
const sqlite3 = require("sqlite3");
const sqliteOpen = require("sqlite").open;
const { Pool, Client } = require("pg");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//////////////////////////////////////////////////////////////////////////
//                      DATABASE TABLE DEFINITIONS
//////////////////////////////////////////////////////////////////////////
const sqlDataTypes =
{
    primaryKey: {
        "sqlite": "INTEGER PRIMARY KEY",
        "postgresql": "SERIAL"
    },
    integer: {
        "sqlite": "INTEGER",
        "postgresql": "INTEGER"
    },
    dateTime: {
        "sqlite": "DATETIME",
        "postgresql": "TIMESTAMP"
    },
    string: {
        "sqlite": "TEXT",
        "postgresql": "TEXT"
    },
    binary: {
        "sqlite": "BLOB",
        "postgresql": "BYTEA"
    }
};

// databaseType: "sqlite" | "postgresql"
function getNoteSQLTable(databaseType, sqlDataTypes)
{
    let NoteSQLTable = null;
    if (databaseType === "sqlite" || databaseType === "postgresql")
    {
        NoteSQLTable = {
            "table_name": "note",
            "columns": [
                { "name": "id", "type": sqlDataTypes.primaryKey[databaseType] },
                { "name": "title", "type": sqlDataTypes.string[databaseType] },
                { "name": "contents", "type": sqlDataTypes.string[databaseType] },
                { "name": "date_added", "type": sqlDataTypes.dateTime[databaseType] },
                { "name": "category_id", "type": sqlDataTypes.integer[databaseType] },
                { "name": "user_id", "type": sqlDataTypes.integer[databaseType] }
            ]
        };
    }
    return NoteSQLTable;
}

// databaseType: "sqlite" | "postgresql"
function getCategorySQLTable(databaseType, sqlDataTypes)
{
    let CategorySQLTable = null;
    if (databaseType === "sqlite" || databaseType === "postgresql")
    {
        CategorySQLTable = {
            "table_name": "category",
            "columns": [
                { "name": "id", "type": sqlDataTypes.primaryKey[databaseType] },
                { "name": "name", "type": sqlDataTypes.string[databaseType] },
                { "name": "date_added", "type": sqlDataTypes.dateTime[databaseType] },
                { "name": "user_id", "type": sqlDataTypes.integer[databaseType] }
            ]
        };
    }
    return CategorySQLTable;
}

// databaseType: "sqlite" | "postgresql"
function getTagSQLTable(databaseType, sqlDataTypes)
{
    let TagSQLTable = null;
    if (databaseType === "sqlite" || databaseType === "postgresql")
    {
        TagSQLTable = {
            "table_name": "tag",
            "columns": [
                { "name": "id", "type": sqlDataTypes.primaryKey[databaseType] },
                { "name": "name", "type": sqlDataTypes.string[databaseType] },
                { "name": "date_added", "type": sqlDataTypes.dateTime[databaseType] },
                { "name": "user_id", "type": sqlDataTypes.integer[databaseType] }
            ]
        };
    }
    return TagSQLTable;
}

// databaseType: "sqlite" | "postgresql"
function getNoteTagSQLTable(databaseType, sqlDataTypes)
{
    let NoteTagSQLTable = null;
    if (databaseType === "sqlite" || databaseType === "postgresql")
    {
        NoteTagSQLTable = {
            "table_name": "note_tag",
            "columns": [
                { "name": "id", "type": sqlDataTypes.primaryKey[databaseType] },
                { "name": "note_id", "type": sqlDataTypes.integer[databaseType] },
                { "name": "tag_id", "type": sqlDataTypes.integer[databaseType] }
            ]
        };
    }
    return NoteTagSQLTable;
}

// databaseType: "sqlite" | "postgresql"
function getUsersSQLTable(databaseType, sqlDataTypes)
{
    let UsersSQLTable = null;
    if (databaseType === "sqlite" || databaseType === "postgresql")
    {
        UsersSQLTable = {
            "table_name": "users",
            "columns": [
                { "name": "id", "type": sqlDataTypes.primaryKey[databaseType] },
                { "name": "username", "type": sqlDataTypes.string[databaseType] + " UNIQUE" },
                { "name": "hashed_password", "type": sqlDataTypes.binary[databaseType] },
                { "name": "salt", "type": sqlDataTypes.binary[databaseType] },
                { "name": "name", "type": sqlDataTypes.string[databaseType] },
                { "name": "email", "type": sqlDataTypes.string[databaseType] + " UNIQUE" },
                { "name": "email_verified", "type": sqlDataTypes.integer[databaseType] },
            ]
        };
    }
    return UsersSQLTable;
}

// databaseType: "sqlite" | "postgresql"
function getSessionsSQLTable(databaseType, sqlDataTypes)
{
    let SessionsSQLTable = null;
    if (databaseType === "sqlite" || databaseType === "postgresql")
    {
        SessionsSQLTable = {
            "table_name": "Sessions",
            "columns": [
                { "name": "id", "type": sqlDataTypes.primaryKey[databaseType] },
                { "name": "sid", "type": sqlDataTypes.string[databaseType] },
                { "name": "expires", "type": sqlDataTypes.dateTime[databaseType] },
                { "name": "createdAt", "type": sqlDataTypes.dateTime[databaseType] },
                { "name": "updatedAt", "type": sqlDataTypes.dateTime[databaseType] },
                { "name": "data", "type": sqlDataTypes.string[databaseType] },
            ]
        };
    }
    return SessionsSQLTable;
}


//////////////////////////////////////////////////////////////////////////
//                   end: DATABASE TABLE DEFINITIONS
//////////////////////////////////////////////////////////////////////////

function createDbConnection(filename)
{
    return sqliteOpen({
        filename: filename,
        driver: sqlite3.Database
    });
}

function convertJsonSqlTableToQueryString(databaseTableJson)
{
    let queryString = `CREATE TABLE ${databaseTableJson.table_name} ( `;
    let i, column;
    for (i = 0; i < databaseTableJson.columns.length - 1; i++)
    {
        column = databaseTableJson.columns[i];
        queryString += `${column.name} ${column.type}, `;
    }
    column = databaseTableJson.columns[i];
    queryString += `${column.name} ${column.type} );`;
    return queryString;
}

async function setupDatabase(dbTables, databasePath)
{
    let queryString, queryResult;
    let databaseHandle;

    try
    {
        sqlite3.verbose();
        databaseHandle = await createDbConnection(databasePath);

        for (let dbTable of dbTables)
        {
            queryString = convertJsonSqlTableToQueryString(dbTable);
            queryResult = await databaseHandle.run(queryString);
        }
    }
    catch (error)
    {
        console.error(error);
    }
    finally
    {
        databaseHandle.close();
    }
}

async function setupPostgresDatabase(dbTables, postgresServerData)
{
    let queryString, queryResult;
    const postgresPool = new Pool(postgresServerData);

    for (let dbTable of dbTables)
    {
        queryString = convertJsonSqlTableToQueryString(dbTable);
        queryResult = await postgresPool.query(queryString);
    }
    // console.log(queryString);
}

async function dropPostgresTables(dbTables, postgresServerData)
{
    let queryString, queryResult;
    const postgresPool = new Pool(postgresServerData);

    for (let dbTable of dbTables)
    {
        queryString = `DROP TABLE IF EXISTS ${dbTable.table_name}`;
        queryResult = await postgresPool.query(queryString);
    }
}

//////////////////////////////////////////////////////////////////////////
//                      running the script
//////////////////////////////////////////////////////////////////////////
const __projectDir = path.join(__dirname, "./");
const projectSettingsFileName = "project_settings.json";
const settingsFilePath = path.join(__projectDir, projectSettingsFileName);
const projectSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));

const SELECTED_DATABASE = projectSettings.database.selected_database;

const MSG_DATABASE_EXISTS = "Do you want to overwrite the existing SQLite database (y/n)? ";

let databaseTablesToCreate;
let databaseType = "sqlite";

if (process.argv.length === 3 && process.argv[2] === "postgresql")
{
    databaseType = "postgresql";
}

if (databaseType === "sqlite")
{
    databaseTablesToCreate = [
        getNoteSQLTable("sqlite", sqlDataTypes),
        getCategorySQLTable("sqlite", sqlDataTypes),
        getTagSQLTable("sqlite", sqlDataTypes),
        getNoteTagSQLTable("sqlite", sqlDataTypes),
        getUsersSQLTable("sqlite", sqlDataTypes),
        getSessionsSQLTable("sqlite", sqlDataTypes)
    ];
}
else if (databaseType === "postgresql")
{
    databaseTablesToCreate = [
        getNoteSQLTable("postgresql", sqlDataTypes),
        getCategorySQLTable("postgresql", sqlDataTypes),
        getTagSQLTable("postgresql", sqlDataTypes),
        getNoteTagSQLTable("postgresql", sqlDataTypes),
        getUsersSQLTable("postgresql", sqlDataTypes),
        getSessionsSQLTable("postgresql", sqlDataTypes)
    ];
}


if (process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === "sqlite"))
{
    (async function()
    {
        const DATABASE_NAME = SELECTED_DATABASE.filename;
        if (fs.existsSync(path.join(__projectDir, DATABASE_NAME)))
        {
            console.log(`database \"${DATABASE_NAME}\" already exists.`);
            rl.question(MSG_DATABASE_EXISTS, function(readInput)
            {
                switch (readInput)
                {
                    case "y":
                    case "Y":
                    case "t":
                    case "T":
                        (async function()
                        {
                            console.log(`deleting \"${DATABASE_NAME}\"...`);
                            fs.unlinkSync(path.join(__projectDir, DATABASE_NAME));
                            console.log(`done.`);
                            console.log(`creating new database file: \"${DATABASE_NAME}\"...`);
                            await setupDatabase(databaseTablesToCreate, path.join(__projectDir, DATABASE_NAME));
                            console.log(`done.`);
                        })();
                    break;
                    default:
                        console.log("aborting");
                    break;
                }
                rl.close();
            });
        }
        else
        {
            console.log(`creating \"${DATABASE_NAME}\" database file...`);
            await setupDatabase(databaseTablesToCreate, path.join(__projectDir, DATABASE_NAME));
            console.log(`done.`);
        }
    })();
}
else if (process.argv.length === 3 && process.argv[2] === "postgresql")
{
    (async function()
    {
        console.log("dropping postgres tables (if exist)...");
        await dropPostgresTables(databaseTablesToCreate, projectSettings.database.postgresql);
        console.log("done.");
        console.log("setting up postgresql tables...");
        await setupPostgresDatabase(databaseTablesToCreate, projectSettings.database.postgresql);
        console.log("done.");
    })();
}
else
{
    console.error("Script called with incorrect argument list.");
}
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const sqlite3 = require("sqlite3");
sqlite3.verbose();
const sqliteOpen = require("sqlite").open;
const createSqliteConnection = require("./routes/server_helper").createSqliteConnection;

const session = require("express-session");
const Sequelize = require("sequelize");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const passport = require("passport");
const LocalStrategy = require("passport-local");
const crypto = require("crypto");

const __projectDir = __dirname;
const projectSettingsFileName = "project_settings.json";
const settingsFilePath = path.join(__projectDir, projectSettingsFileName);
const projectSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));

const { Pool, Client } = require("pg");

const postgresPool = new Pool(projectSettings.database.postgresql);

const helper = require("./routes/server_helper");

let sequelize;

(async function()
{
if (projectSettings.database.selected_database === "sqlite")
{
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./db.sqlite3",
    logging: false
  });
}
else if (projectSettings.database.selected_database === "postgresql")
{
  sequelize = new Sequelize(
  projectSettings.database.postgresql.database,
  projectSettings.database.postgresql.user,
  projectSettings.database.postgresql.password,
  {
    host: projectSettings.database.postgresql.host,
    port: projectSettings.database.postgresql.port,
    dialect: "postgres",
    logging: false
  });

  // sequelize = new Sequelize("postgres://postgres:123qweasd!@localhost:5433/note_manager_app");

  // try {
  //   await sequelize.authenticate();
  //   console.log('Connection has been established successfully.');

  //   const [results, metadata] = await sequelize.query("SELECT 23+7 AS sum_result;");
  //   console.log(results);

  // } catch (error) {
  //   console.error('Unable to connect to the database:', error);
  // }
}
})();


// async function testDbSequelize()
// {
//   try
//   {
//     await sequelize.authenticate();
//     console.log("Connection has been established successfully.");
//   }
//   catch (error)
//   {
//     console.log("unable to connect to the database: ", error);
//   }
// }

// sequelize.close();
// testDbSequelize();


// setup passport
const customFields =
{
  usernameField: "username",
  passwordField: "password",
};

const verifyCallback = async (username, password, done) =>
{
  try {
    let user;
    if (projectSettings.database.selected_database === "sqlite")
    {
      const databaseHandle = await createSqliteConnection(
        path.join(__projectDir, projectSettings.database.sqlite.filename)
      );
      user = await databaseHandle.get("SELECT * FROM users WHERE username = ?", [username]);
      await databaseHandle.close();
      // console.log(`user (sqlite) = `);
      // console.log(user)
    }
    else if (projectSettings.database.selected_database === "postgresql")
    {
      user = (await postgresPool.query(`SELECT * FROM users WHERE username = '${username}'`)).rows[0];
      // console.log(`user (postgres) = `);
      // console.log(user)
    }
    if (!user)
      return done(null, false, { message: "Incorrect username or password" });

    crypto.pbkdf2(password, user.salt, 310000, 32, "sha256", function (err, hashedPswd) {
      if (err) return done(err);
      if (!crypto.timingSafeEqual(user.hashed_password, hashedPswd))
        return done(null, false, { message: "Incorrect password" });
      return done(null, user);
    });
  }
  catch (error) {
    return done(error);
  }
};

const strategy = new LocalStrategy(customFields, verifyCallback);

const app = express();
const portNumber = process.env.PORT || 8001;

const jsonParser = bodyParser.json();
let urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static(path.join(__dirname, "public"), { index: false } ));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const maxAgeDebug20s = 20*1000;

app.use(
  session({
    secret: "secret message", // env.secret
    store: new SequelizeStore({ db: sequelize }),
    resave: false,
    proxy: true,
    cookie: {
      maxAge: (1000 * 3600 * 12) // 12h
      // maxAge: maxAgeDebug20s
    }
  }),
);

passport.use(strategy);

passport.serializeUser(function(user, done)
{
  process.nextTick(function()
  {
    // console.log(`serializeUser() -> ${user}`);
    // console.log(user);
    done(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, done)
{
  process.nextTick(function()
  {
    // console.log(`deserializeUser() -> ${user}`);
    // console.log(user);
    return done(null, user);
  });
  
});

app.use(passport.initialize());
app.use(passport.session());

app.use(helper.logRequestInfo);

app.get('/', function (req, res, next)
{
  // console.log(`Request: [${req.method}], `, req.originalUrl);
  res.sendFile('index.html', { root: path.join(__dirname, "public") });
});

app.get("/postgres-test", function(req, res, next)
{
  // console.log(`Request: [${req.method}], `, req.originalUrl);
  postgresPool.query("SELECT * FROM note", (err, queryResult) =>
  {
    if (err) res.json({msg: "error"});
    res.json(queryResult.rows);
  });
});


const apiRoutes = require("./routes/api/apiRoutes");
app.use("/api", apiRoutes);


app.listen(portNumber);
console.log(new Date().toLocaleString("pl-PL",
  { hour12: false }) + ", starting server on port:", portNumber);


// postgresPool.end();
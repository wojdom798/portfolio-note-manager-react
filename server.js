const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const sqlite3 = require("sqlite3");
sqlite3.verbose();
const sqliteOpen = require("sqlite").open;

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


function createDbConnection(filename)
{
  return sqliteOpen({
    filename: filename,
    driver: sqlite3.Database
  });
}


const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db.sqlite3",
  logging: false
});


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
    const databaseHandle = await createDbConnection(
      path.join(__projectDir, projectSettings.database.filename));
    let user = await databaseHandle.get("SELECT * FROM users WHERE username = ?", [username]);
    await databaseHandle.close();
    if (!user)
      return done(null, false, { message: "Incorrect username or password" });

    crypto.pbkdf2(password, user.salt, 310000, 32, "sha256", function (err, hashedPswd) {
      if (err) return done(err);
      if (!crypto.timingSafeEqual(user.hashed_password, hashedPswd))
        return done(null, false, { message: "Incorrect username or password" });
    });
    return done(null, user);
  }
  catch (error) {
    return done(error);
  }
};

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.serializeUser(function(user, done)
{
  done(null, user);
});

passport.deserializeUser(function(user, done)
{
  done(null, user);
});

const app = express();
const portNumber = process.env.PORT || 8001;

const jsonParser = bodyParser.json();
let urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret message", // env.secret
    store: new SequelizeStore({ db: sequelize }),
    resave: false,
    proxy: true,
    cookie: {
      maxAge: (1000 * 3600 * 12) // 12h
    }
  }),
);

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session())

app.get('/', function (req, res, next)
{
  console.log(`Request: [${req.method}], `, req.originalUrl);
  res.sendFile('index.html', { root: path.join(__dirname, "public") });
});


const apiController = require("./server_controllers/api/apiController");
app.use("/api", apiController);


app.listen(portNumber);
console.log(new Date().toLocaleString("pl-PL",
  { hour12: false }) + ", starting server on port:", portNumber);
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const bodyParser = require('body-parser');
const express = require('express')
const dotenv = require("dotenv");
const helmet = require('helmet');
const hpp = require('hpp');
const session = require("express-session");
const MemoryStore = require('memorystore')(session);
const serveStatic = require( "serve-static" );
const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')

dotenv.config()

const csrfProtection = csrf({ cookie: true });

const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source =>
        readdirSync(source).map(name =>
        join(source, name))
        .filter(isDirectory)
        .filter(item => !item.includes("."))
        .filter(item => !item.includes("node_modules"))

const base = {};

const app = express()

app.use(hpp());
app.use(helmet());

const limiter = require('express-limiter')(app);

// Limit requests to 100 per hour per ip address.
limiter({
  lookup: ['connection.remoteAddress'],
  total: 100,
  expire: 1000 * 60 * 60
})

app.use('/', serveStatic(__dirname + '/static'));

app.use(
  session({
    // Change the secret to an environment var if needed
    cookie: {
      maxAge: 86400000,
      httpOnly: true,
      secure: true,
    },
    key: "myCookieSessionId",
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// This next bit is used to stop getting to a url unless authentication has been achieved

app.route('/dash*').all(function (req, res, next) {
    if (req.session.user){
        next();
    }else{
        res.status(204).send('204 | No Content')
    }
});

// need to wrap this so that only an admin can use... probably using session.user.admin
app.get('/lapi/:dir', function(req,res) {
  try{
    var dynamicController = require('./apps/'+req.params.dir+'/server/index.js');
    app.use('/', dynamicController.render)
    res.status(200).send('Loaded: '+req.params.dir);
  }catch(e){
    res.status(200).send('No such app in the apps directory')
  }
});

// Load all the apps in the apps directory dynamically
getDirectories('./apps/').forEach(function(dir){
  base[dir] = require('./apps/.dist/'+dir.replace("apps/","")+'/index.js')
  app.use('/', base[dir])
  //console.log('./apps/.dist/'+dir.replace("apps/","")+'/index.js')
  console.log(dir+'::Loaded')
});

app.listen(3000);
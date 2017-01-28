// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const bodyParser = require('body-parser-json');
const Sequelize = require('sequelize');

app.use(express.static('public'));
app.use(bodyParser.json({strict: true}));

const sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  host: '0.0.0.0',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  storage: '.data/database.sqlite'
});

var Sensor;

sequelize.authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
    Sensor = sequelize.define('sensors', {
      identifier: {
        type: Sequelize.STRING,
      },
      temp: {
        type: Sequelize.DOUBLE
      },
      humidity: {
        type: Sequelize.DOUBLE
      }
    });
    
    setup();
  })
  .catch(function (err) {
    console.log('Unable to connect to the database: ', err);
  });

function setup(){
}
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

var readings = [];

app.post("/weather", function (request, response) {
  const j = request.body;
  
  if (j.secret !== process.env.SECRET) {
    response.status(401).send({});
    return;
  }
  
  if (j.id && j.h && j.t) {
    Sensor.create({identifier: j.id, temp: j.t, humidity: j.h});
    response.status(200).send({});
    
    return;
  }
  
  response.status(400).send({});
});

app.get("/weather", function (request, response) {
  var allSensors = [];
  Sensor.findAll({limit:60*48, order: [['createdAt', 'DESC']]}).then(function(sensors) {
    sensors.forEach(function(sensor) {
      allSensors.push({id: sensor.identifier, t: sensor.temp, h: sensor.humidity, created: sensor.createdAt});
    })
    response.status(200).send(allSensors.reverse());
  })
  
  
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

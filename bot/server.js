const express = require("express");
const mqtt = require("mqtt");
const { MongoClient } = require("mongodb");
const line = require("@line/bot-sdk");
const ngrok = require("ngrok");
const e = require("express");

const HOST = "0.0.0.0";
const PORT = process.env.PORT || 8000;

let pressure;
let temperature;
let humidity;

// use custom env
require("dotenv").config();

// config line channel
const line_cfg = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

//config liff channel
const liff_cfg = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LIFF_CHANNEL_SECRET,
};



const app = express();

//liff---
//-----

app.get("/", async (req, res) => {
  const value = parseInt(req.query.value);
  const results = await try_query(value);
  const summary = results.map((a) => a.timestamp);
  console.log(summary);
  res.send(summary.toString());
});

const mqttClient = mqtt.connect("mqtt://broker.hivemq.com");
mqttClient.on("connect", function () {
  mqttClient.subscribe("cn466/cucumber_4/sensor", function (err) {
    if (!err) {
      const obj = { status: "ok" };
      mqttClient.publish("cn466/status", JSON.stringify(obj));
    }
  });
});

mqttClient.on("message", function (topic, message) {
  // message is Buffer
  console.log(message.toString());
  const msg = JSON.parse(message.toString());
  try_insert(msg.pressure, msg.temperature, msg.humidity).catch(console.dir);

  /*lineClient.pushMessage(event.userID, {type: 'text', text: 'pressure : '+ msg.pressure.toString()})
  lineClient.pushMessage(event.userID, {type: 'text', text: 'temperature : '+ msg.temperature.toString()})
  lineClient.pushMessage(event.userID, {type: 'text', text: 'humidity : ' + msg.humidity.toString()})
  */

  pressure = msg.pressure;
  temperature = msg.temperature;
  humidity = msg.humidity
});


// MongoDB-------------------------------------------------------

const mongodbClient = new MongoClient(process.env.MONGODB_URI);

async function try_connect() {
  try {
    await mongodbClient.connect();
    const database = mongodbClient.db("cn466");
    try {
      await database.createCollection("sensor");
      console.log("Collection created!");
    } catch (err) {
      console.log("Collection exist!");
    }
  } finally {
    await mongodbClient.close();
  }
}

async function try_insert(temperature, humidity) {
  var results;
  try {
    await mongodbClient.connect();
    const database = mongodbClient.db("cn466");
    const sensor = database.collection("sensor");
    const doc = { timestamp: new Date(), temperature: temperature, humidity: humidity };
    console.log(doc);
    results = await sensor.insertOne(doc);
    // do X
  } finally {
    await mongodbClient.close();
  }
  console.log(results);
}

async function try_query(value) {
  var results;
  try {
    await mongodbClient.connect();
    const database = mongodbClient.db("cn466");
    const sensor = database.collection("sensor");
    const cond = { value: value };
    results = await sensor.find(cond).toArray();
  } finally {
    await mongodbClient.close();
  }
  console.log(results);
  return results;
}

try_connect().catch(console.dir);

// LINE

const lineClient = new line.Client(line_cfg);

app.post("/callback", line.middleware(line_cfg), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  
  if (event.type === 'message' || event.message.type === 'text') {
    var eventText = event.message.text.toLowerCase();
    //reply
    console.log('event text')
    console.log(eventText)
    if(eventText === 'temperature' ){
      console.log('event text temperature')
      lineClient.replyMessage(event.replyToken, {type: 'text', text: 'temperature : '+ temperature.toString()});
    } else if(eventText === 'humidity'){
      lineClient.replyMessage(event.replyToken, {type: 'text', text: 'humidity : ' + humidity.toString()});
    } else if(eventText === 'pressure'){
      lineClient.replyMessage(event.replyToken,{type: 'text', text: 'pressure : '+ pressure.toString()});
    }      
  } else {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
}

app.listen(PORT, () => {
  console.log("Connecting to ngrok...");
  ngrok.connect(PORT, {authtoken: process.env.NGROK_AUTH_TOKEN}).then(url => {
    console.log(`listering on ${url}/callback`);
    lineClient.setWebhookEndpointUrl(url + '/callback');
  }).catch(console.error);
});

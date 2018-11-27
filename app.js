var express = require('express');
var http = require('http')
var socketio = require('socket.io');
var app = express();
var server = http.Server(app);
var websocket = socketio(server);

const MongoClient = require('mongodb').MongoClient;
const { DATABASE_USERNAME, DB_PASSWORD, DB_ML_USER } = process.env;
const MONGO_URL = `mongodb://${DATABASE_USERNAME}:${DB_PASSWORD}@ds243931.mlab.com:43931/${DB_ML_USER}`;

server.listen(process.env.PORT || 4001, () => console.log(`Heroku: ${process.env.PORT} | LocalHost: 4001`));

websocket.on('connection', (socket) => {
  
  console.log('A client just joined on...', socket.id);

  setInterval(async () => {
    try {
      const client = await MongoClient.connect(MONGO_URL, { useNewUrlParser: true });
      const myDb = await client.db('dads-app-db');
      const MessagesCollection = await myDb.collection('messages');
      const messages = await MessagesCollection.find().toArray();
      console.log('no. of messages: ', messages.length);
      socket.emit('messages', messages);
    } catch (error) {
      console.log('error', error);
    }
  }, 2000);
  

  socket.on('newMessage', async (newMessage) => {
    const client = await MongoClient.connect(MONGO_URL, { useNewUrlParser: true });
    const myDb = await client.db('dads-app-db');
    const MessagesCollection = myDb.collection('messages');
    MessagesCollection.insertOne(newMessage)
  });

});


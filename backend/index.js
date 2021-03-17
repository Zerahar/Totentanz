const express = require('express')
const app = express()
const port = 3002
const pass = "dbpass123"

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use(express.json())
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

var mongo = require('mongodb')

mongo.MongoClient.connect(`mongodb+srv://dbAdmin:${pass}@oppari.q4dhm.mongodb.net/data?retryWrites=true&w=majority`, function (err, client) {
  if (err) throw err

  const db = client.db('data')
  // Fetch character
  app.get('/character/:charId', (req, res) => {
    const query = { _id: new mongo.ObjectId(req.params.charId) }
    db.collection('characters').findOne(query, function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Remove character
  app.get('/character/delete/:charId', (req, res) => {
    const query = { _id: new mongo.ObjectId(req.params.charId) }
    db.collection('characters').deleteOne(query, function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Fetch all characters
  app.get('/character/', (req, res) => {
    db.collection('characters').find().toArray(function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Update character
  app.post('/character/:charId', (req, res) => {
    const query = { _id: new mongo.ObjectId(req.params.charId) }
    const document = {
      $set: {
        name: req.body.name,
        age: req.body.age,
        player: req.body.player,
        gender: req.body.gender,
        history: req.body.history,
        description: req.body.description,
        mechanics: req.body.mechanics,
        saldo: req.body.saldo,
        plots: req.body.plots,
      }
    }
    db.collection('characters').updateOne(query, document, function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Update character
  app.post('/character/user/:charId', (req, res) => {
    const query = { _id: new mongo.ObjectId(req.params.charId) }
    const document = {
      $set: {
        player: req.body.player
      }
    }
    db.collection('characters').updateOne(query, document, function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Add character
  app.post('/character', (req, res) => {
    db.collection('characters').insertOne(req.body, function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Add user
  app.post('/user', (req, res) => {
    db.collection('users').insertOne(req.body, function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Update user
  app.post('/user/:userId', (req, res) => {
    const query = { _id: new mongo.ObjectId(req.params.userId) }
    const document = {
      $set: {
        userName: req.body.userName,
        login: req.body.login,
        character: req.body.character,
        userType: req.body.userType
      }
    }
    db.collection('users').updateOne(query, document, function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Fetch user
  app.get('/user/:login', (req, res) => {
    console.log(req.params.login)
    const query = { login: req.params.login }
    db.collection('users').findOne(query, function (err, result) {
      if (err) throw err
      if (result)
        res.send(result)
      else
        res.status(404).send('')
      db.close
    })
  })

  // Fetch all users
  app.get('/user/', (req, res) => {
    db.collection('users').find().toArray(function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Remove user
  app.get('/user/delete/:charId', (req, res) => {
    const query = { _id: new mongo.ObjectId(req.params.charId) }
    db.collection('users').deleteOne(query, function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Add chat
  app.post('/chat', (req, res) => {
    db.collection('chats').insertOne(req.body, function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Fetch all chats
  app.get('/chat/', (req, res) => {
    db.collection('chats').find().toArray(function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Fetch all chats for certain user
  app.get('/chat/user/:userId', (req, res) => {
    const query = { participants: { userId: req.params.userId } }
    db.collection('chats').find(query).toArray(function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })
})

var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function (request, response) {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});
server.listen(1337, function () { });

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});
// latest 100 messages
var history = [];
// list of currently connected clients (users)
var clients = [];
/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}// Array with some colors
var colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange'];
// ... in random order
colors.sort(function (a, b) { return Math.random() > 0.5; });
// WebSocket server
wsServer.on('request', function (request) {
  console.log((new Date()) + ' Connection from origin '
    + request.origin + '.');
  var connection = request.accept(null, request.origin);
  // we need to know client index to remove them on 'close' event
  var index = clients.push(connection) - 1;
  var userName = false;
  var userColor = false;
  // send back chat history
  if (history.length > 0) {
    connection.sendUTF(
      JSON.stringify({ type: 'history', data: history }));
  }

  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      console.log(message)
    }
    if (userName === false) {
      // remember user name
      userName = htmlEntities(message.utf8Data);
      // get random color and send it back to the user
      userColor = colors.shift();
      connection.sendUTF(
        JSON.stringify({ type: 'color', data: userColor }));
      console.log((new Date()) + ' User is known as: ' + userName
        + ' with ' + userColor + ' color.');
    } else { // log and broadcast the message
      console.log((new Date()) + ' Received Message from '
        + userName + ': ' + message.utf8Data);

      // we want to keep history of all sent messages
      var obj = {
        time: (new Date()).getTime(),
        text: htmlEntities(message.utf8Data),
        author: userName,
        color: userColor
      };
      history.push(obj);
      history = history.slice(-100);        // broadcast message to all connected clients
      var json = JSON.stringify({ type: 'message', data: obj });
      for (var i = 0; i < clients.length; i++) {
        clients[i].sendUTF(json);
      }
    }
  });

  connection.on('close', function (connection) {
    if (userName !== false && userColor !== false) {
      console.log((new Date()) + " Peer "
        + connection.remoteAddress + " disconnected.");      // remove user from the list of connected clients
      clients.splice(index, 1);
      // push back user's color to be reused by another user
      colors.push(userColor);
    }
  });
});
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
const url = `mongodb+srv://dbAdmin:${pass}@oppari.q4dhm.mongodb.net/data?retryWrites=true&w=majority`
mongo.MongoClient.connect(url, function (err, client) {
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
    console.log("Fetching all characters")
    db.collection('characters').find().toArray(function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Update character
  app.post('/character/:charId', (req, res) => {
    console.log("Character " + req.params.charId + " updated")
    let promise2, promise3
    const query = { _id: new mongo.ObjectId(req.params.charId) }
    const document = {
      $set: {
        name: req.body.name,
        age: req.body.age,
        player: req.body.player,
        gender: req.body.gender,
        description: req.body.description,
        mechanics: req.body.mechanics,
        saldo: mongo.Double(req.body.saldo),
        plots: req.body.plots,
      }
    }
    // Update character
    const promise1 = new Promise(function (resolve, reject) {
      db.collection('characters').updateOne(query, document, function (err, result) {
        if (err) reject(err)
        console.log("Update 1")
        db.close
        resolve(result)
      })
    })

    // If player changed, update new player
    if (req.body.newPlayer) {
      const query2 = { _id: new mongo.ObjectId(req.body.player) }
      const document2 = {
        $set: {
          character: req.params.charId
        }
      }
      promise2 = new Promise(function (resolve, reject) {
        db.collection('users').updateOne(query2, document2, function (err, result) {
          if (err) reject(err)
          console.log("Update 2")
          db.close
          resolve(result)
        })
      })
    }
    // If there was a previous player, update that as well
    if (req.body.oldPlayer) {
      const query3 = { _id: new mongo.ObjectId(req.body.oldPlayer) }
      const document3 = {
        $set: {
          character: ''
        }
      }
      promise3 = new Promise(function (resolve, reject) {
        db.collection('users').updateOne(query3, document3, function (err, result) {
          if (err) reject(err)
          console.log("Update 3")
          db.close
          resolve(result)
        })
      }
      )
    }
    Promise.all([promise1, promise2, promise3])
      .then(responses => res.send(responses))
  })

  // Update character's player
  app.post('/character/user/:charId', (req, res) => {
    console.log("Player for character " + req.params.charId + " updated")
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

  // Update character's saldo
  app.post('/character/saldo/:charId', (req, res) => {
    console.log(req.body.saldo, req.params.charId)
    const query = { _id: new mongo.ObjectId(req.params.charId) }
    const document = {
      $inc: {
        saldo: mongo.Double(req.body.saldo)
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
    const document = {
      name: req.body.name,
      age: req.body.age,
      player: req.body.player,
      gender: req.body.gender,
      description: req.body.description,
      mechanics: req.body.mechanics,
      saldo: mongo.Double(req.body.saldo),
      plots: req.body.plots
    }
    let promise2 = (id) => null
    const promise1 = new Promise(function (resolve, reject) {
      db.collection('characters').insertOne(document, function (err, result) {
        if (err) reject(err)
        resolve(result)
        db.close
      })
    })
    if (req.body.player) {
      const query2 = { _id: new mongo.ObjectId(req.body.player) }
      promise2 = (id) => new Promise(function (resolve, reject) {
        db.collection('users').updateOne(query2, {
          $set: {
            character: id
          }
        }, function (err, result) {
          if (err) reject(err)
          resolve(result)
          db.close
        })
      })
    }
    promise1
      .then(result => result.insertedId)
      .then(id => promise2(id))
      .then(result => res.send(result))
      .then(console.log("Added a new character"))
  })

  // Add user
  app.post('/user', (req, res) => {
    let newId, oldPlayer
    let promise2 = () => null
    let promise3 = () => null
    let promise4 = () => null
    // Insert new user
    const promise1 = new Promise((resolve, reject) => {
      db.collection('users').insertOne(req.body, function (err, result) {
        console.log("Added new user")
        if (err) reject(err)
        db.close
        newId = result.insertedId
        resolve(result.insertedId)
      })
    })

    // Get character's old player
    if (req.body.character) {
      console.log("New user had a character, checking if it already had a player")
      const query = { _id: new mongo.ObjectId(req.body.character) }
      promise2 = new Promise((resolve, reject) => {
        db.collection('characters').findOne(query, function (err, result) {
          if (err) reject(err)
          db.close
          oldPlayer = result.player
          if (oldPlayer)
            console.log("It had")
          resolve(result.player)
        })
      })


      // Remove character from old player
      promise3 = new Promise((resolve, reject) => {
        if (oldPlayer) {
          console.log("Character already had a player, id " + oldPlayer + ", updating player")
          const query2 = { _id: new mongo.ObjectId(oldPlayer) }
          const document = {
            $set: {
              character: ""
            }
          }

          db.collection('users').updateOne(query2, document, function (err, result) {
            if (err) reject(err)
            db.close
            resolve(result)
          })
        }
      })


      // Add new player to character
      promise4 = new Promise((resolve, reject) => {
        if (newId) {
          console.log("Adding new player to character, player id " + newId)
          const query = { _id: new mongo.ObjectId(req.body.character) }
          const document = {
            $set: {
              player: newId
            }
          }

          db.collection('characters').updateOne(query, document, function (err, result) {
            if (err) reject(err)
            db.close
            resolve(result)
          })
        }
      })
    }

    Promise.all([promise1, promise2])
      .then(results => Promise.all([promise3, promise4])
        .then(results => res.send(results)))
    // .catch(res.status(500).send("Käyttäjää lisätessä tapahtui virhe. Yritä uudelleen tai ota yhteys pelinjohtoon."))

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
    console.log("Fetching all users")
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

  // Fetch all chats for certain character
  app.get('/chat/:charId', (req, res) => {
    const query = { "participants._id": req.params.charId }
    db.collection('chats').find(query).toArray(function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })
  // Remove chat
  app.get('/chat/delete/:chatId', (req, res) => {
    const query = { _id: new mongo.ObjectId(req.params.chatId) }
    db.collection('chats').deleteOne(query, function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Fetch a chat
  app.get('/chat/:chatId', (req, res) => {
    const query = { _id: new mongo.ObjectId(req.params.chatId) }
    db.collection('chats').findOne(query, function (err, result) {
      if (err) throw err
      console.log("Fetchin a chat with id " + req.params.chatId)
      res.send(result)
      db.close
    })
  })

  // Add payment
  app.post('/pay', (req, res) => {
    db.collection('transactions').insertOne(req.body, function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })


  // Fetch all payments
  app.get('/transaction/', (req, res) => {
    db.collection('transactions').find().sort({ "time": -1 }).toArray(function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })
})

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 1337 });

// Fetch all chats
let chats
mongo.MongoClient.connect(url, function (err, client) {
  if (err) throw err
  const db = client.db('data')
  db.collection('chats').find().toArray(function (err, result) {
    if (err) throw err
    chats = result
    db.close
  })
})

wss.on('connection', function connection(ws) {
  console.log("New connection")
  ws.on('message', function incoming(rawdata) {
    const data = JSON.parse(rawdata)
    // The new connection sent its identifications
    if (data.type === "new") {
      console.log("New connection identity: ", data)
      ws.characterId = data.id || "admin"
    }
    // User opened a chat
    if (data.type === "openChat") {
      console.log("Chat was opened, id: ", data.chat)
      // send back chat history when chat is opened
      mongo.MongoClient.connect(url, function (err, dbclient) {
        if (err) throw err
        const db = dbclient.db('data')
        db.collection('messages').find({ chat: data.chat }).toArray(function (err, result) {
          if (err) throw err
          console.log("Sent chat history")
          ws.send(JSON.stringify({ type: 'history', data: result }));
          db.close
        })
      })
    }
    // User sent a message in chat
    if (data.type === "message") {
      console.log("Received a message: ", data)
      // Modify for database saving
      var obj = {
        time: (new Date()).getTime(),
        text: data.text,
        author: data.name,
        authorId: data.id,
        chat: data.chat
      };
      mongo.MongoClient.connect(url, function (err, client) {
        if (err) throw err
        const db = client.db('data')
        db.collection('messages').insertOne(obj, function (err, result) {
          if (err) throw err
          db.close
        })
      })
      console.log("Saved message to database")
    }
    wss.clients.forEach(function each(client) {

      // User sent a message in chat
      if (data.type === "message") {
        // Modify for database saving
        var obj = {
          time: (new Date()).getTime(),
          text: data.text,
          author: data.name,
          authorId: data.id,
          chat: data.chat
        };
        // Broadcast if part of the chat
        const currentChat = chats.find(chat => chat._id == data.chat)
        if ((client.characterId === "admin" || currentChat.participants.find(participant => participant._id === client.characterId)) && client.readyState === WebSocket.OPEN) {
          console.log("Broadcasted to " + data.name)
          const packet = { type: "message", data: obj }
          client.send(JSON.stringify(packet));
        }
      }
    });
  });


});

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
})

const express = require('express')
const app = express()
const port = 3002
const pass = "dbpass123"
// var expressMongoDb = require('express-mongo-db');
// app.use(expressMongoDb(`mongodb+srv://dbAdmin:${pass}@oppari.q4dhm.mongodb.net/data?retryWrites=true&w=majority`));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

var mongo = require('mongodb')

mongo.MongoClient.connect(`mongodb+srv://dbAdmin:${pass}@oppari.q4dhm.mongodb.net/data?retryWrites=true&w=majority`, function (err, client) {
  if (err) throw err

  const db = client.db('data')
// Fetch character
  app.get('/character/:charId', (req, res) => {
    const query = { _id: new mongo.ObjectId(req.params.charId)}
    db.collection('characters').findOne(query, function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

  // Update character
  app.post('/character/:charId', (req, res) => {
    const query = { _id: new mongo.ObjectId(req.params.charId)}
    const document = {}
    db.collection('characters').updateOne(query, document, function (err, result) {
      if (err) throw err
      res.send(result)
      db.close
    })
  })

    // Add character
    app.post('/character', (req, res) => {
      const document = {}
      db.collection('characters').insertOne(document, function (err, result) {
        if (err) throw err
        res.send(result)
        db.close
      })
    })
})

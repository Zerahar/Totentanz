const express = require('express')
const app = express()
const port = 3002

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

var MongoClient = require('mongodb').MongoClient
const pass = "dbpass123"

MongoClient.connect(`mongodb+srv://dbAdmin:${pass}@oppari.q4dhm.mongodb.net/data?retryWrites=true&w=majority`, function (err, client) {
  if (err) throw err

  var db = client.db('data')

  db.collection('characters').find().toArray(function (err, result) {
    if (err) throw err

    console.log(result)
  })
})

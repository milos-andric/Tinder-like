
const express = require('express')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const pgp = require('pg-promise')(/* options */)
const db = pgp('postgres://postgres:changeme@postgres:5432/matcha')

app.get("/test", (req, res) => {
  
  db.one('SELECT $1 AS value', 123)
  .then((data) => {
    console.log('DATA:', data.value)
  })
  .catch((error) => {
    console.log('ERROR:', error)
  })

  res.send('test')
});

export default {
  path: '/api',
  handler: app
}

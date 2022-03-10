
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
    res.send({d:data.value})
  })
  .catch((error) => {
    console.log('ERROR:', error)
  })

  res.send('test')
});

app.get("/login", (req, res) => {
  
  console.log('You tried to login')
  res.send('You tried to login')
});

app.get("/register", (req, res) => {
  
  console.log('You tried to register')
  res.send('You tried to register')
});

export default {
  path: '/api',
  handler: app,
  middleware: "auth",
}


const express = require('express')

const bcrypt = require('bcrypt')
const saltRounds = 10

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const pgp = require('pg-promise')(/* options */)
const db = pgp('postgres://postgres:changeme@postgres:5432/matcha_db')

app.get("/test", (req, res) => {
  
  db.query('SELECT * FROM users')
  .then((data) => {
    res.send(data)
  })
  .catch((error) => {
    console.log('ERROR:', error)
  })
});

app.get("/login", (req, res) => {
  
  console.log('You tried to login')
  res.send('You tried to login')
});


app.post('/register', (req, res) => {

  console.log(req.body.first_name);

  const firstName = req.body.first_name
  const lastName = req.body.last_name
  const userName = req.body.username
  const email = req.body.email
  const password = req.body.password
  const gender = req.body.gender

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) console.log(err);
    db.query(
      "INSERT INTO users (first_name, last_name, user_name, email, password, gender) VALUES (?,?,?,?,?,?,?)",
      [firstName, lastName, userName, email, password, gender],
      (err, result) => {
        console.log(err);
      }
    )
  })

})

export default {
  path: '/api',
  handler: app,
  middleware: "auth",
}

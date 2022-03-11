const express = require('express')

const bcrypt = require('bcrypt')
const saltRounds = 10

const jwt = require('jsonwebtoken')
require('dotenv').config();
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const db = require("../api/connect")
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
}
app.get('/test', (req, res) => {
  db.query('SELECT * FROM users')
    .then((data) => {
      res.send(data)
    })
    .catch((_error) => {
    })
})

// app.get('/login', (req, res) => {
//   console.log('You tried to login')
//   res.send('You tried to login')
// })

app.post('/register', (req, res) => {
  const firstName = req.body.first_name
  const lastName = req.body.last_name
  const userName = req.body.user_name
  const email = req.body.email
  const gender = req.body.gender

  const sql = `INSERT INTO users
            (
              first_name, last_name, user_name, email, password, gender
            )
            VALUES
            (
                $1, $2, $3, $4, $5, $6
            )`
  bcrypt
    .hash(req.body.password, saltRounds)
    .then(function (password) {
      db.none(
        sql,
        [firstName, lastName, userName, email, password, gender],
        function (err, data) {
          if (err) {
            // some error occured
            res.sendStatus(500)
          } else {
            // successfully inserted into db
            // todo login direct lol
            res.sendStatus(200)
          }
        }
      )
        .then(() => {
          // success;
          res.sendStatus(200)
        })
        .catch((_error) => {
          res.sendStatus(500)
          // error;
        })
    })
    .catch((_error) => {
      res.sendStatus(500)
      // error;
    })
})

app.post('/login', (req, res) => {
  const username = req.body.username

  db.one('SELECT * FROM users WHERE user_name = $1', username)
    .then(function (data) {
      bcrypt.compare(req.body.password, data.password, function (_err, result) {
        if (result === true) {
              const accessToken = generateAccessToken(data);
              res.send({
                accessToken,
              })
            } else {
              res.status(404).send('Sorry,bad password');

        }
      })
  }).catch(function (_error) {
    // error;
    res.status(404).send('Sorry, no user found');
  })
})

export default {
  path: '/api',
  handler: app,
  middleware: 'auth',
}

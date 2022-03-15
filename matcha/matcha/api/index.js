const express = require('express')

const bcrypt = require('bcrypt')
const saltRounds = 10

const jwt = require('jsonwebtoken')
require('dotenv').config()
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const db = require('../api/connect')

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' })
}

app.get('/me', (req, res) => {
  // const sql = `SELECT * FROM users WHERE user_id=$1`

  // db.one(sql, [1]).then((data) => {
  //   res.sendStatus(data)
  // }).catch((e) => {
  //   res.sendStatus(e)
  // })
})

// Post Routes

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
      .catch((e) => {
        res.sendStatus(500)
        // error;
      })
    })
    .catch((e) => {
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
          const accessToken = generateAccessToken(data)
          res.send({token: accessToken, msg: 'Success'})
        } else {
          res.status(403).send({token: null, msg: "Invalid password"})
        }
      })
    })
    .catch(function (_error) {
      // error;
      res.status(403).send({token: null, msg: "User is not found"})
    })
})

export default {
  path: '/api',
  handler: app,
  middleware: 'auth',
}

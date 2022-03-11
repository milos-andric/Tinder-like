const express = require('express')

const bcrypt = require('bcrypt')
const saltRounds = 10

const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const pgp = require('pg-promise')(/* options */)
const db = pgp('postgres://postgres:changeme@postgres:5432/matcha_db')

app.get('/test', (req, res) => {
  db.query('SELECT * FROM users')
    .then((data) => {
      res.send(data)
    })
    .catch((error) => {
      console.log('ERROR:', error)
    })
})

// app.get('/login', (req, res) => {
//   console.log('You tried to login')
//   res.send('You tried to login')
// })

app.post('/register', (req, res) => {
  console.log(req.body)

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
            console.log(err)
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
        .catch((error) => {
          res.sendStatus(500)
          console.log(error)
          // error;
        })
    })
    .catch((error) => {
      res.sendStatus(500)
      console.log(error)
      // error;
    })
})

app.post('/login', (req, res) => {
  const username = req.body.username

  db.any('SELECT * FROM users WHERE user_name = $1', username)
    .then(function (data) {
      bcrypt.compare(req.body.password, data[0].password, function (err, res) {
        if (err) {
          // handle error
          res.send(err)
        }
        if (res) {
          // Send JWT
          const id = res[0].id
          const token = jwt.sign({ id }, process.env.LOGIN_SECRET, {
            expiresIn: 300 * 1000,
          })
          req.session.user = res

          res.send({ auth: true, token, result: res })
        } else {
          // response is OutgoingMessage object that server response http request
          return res.send({ success: false, message: 'passwords do not match' })
        }
      })
    })
    .catch(function (error) {
      // error;
      res.send(error)
    })

  // db.query(
  //   "SELECT * FROM users WHERE mail = ?;",
  //   mail,
  //   (err, result) => {
  //     if (err) console.log(err);
  //     if (err || !result) return res.send({err: "no database"})
  //     // console.log(result);
  //     if (result.length > 0) {
  //       bcrypt.compare(password, result[0].pass, (error, response) => {
  //         if (response) {
  //           const id = result[0].id
  //           const token = jwt.sign({id}, process.env.LOGIN_SECRET, {
  //             expiresIn: 300 * 1000,
  //           })
  //           req.session.user = result

  //           res.json({auth: true, token: token, result: result})
  //         }
  //         else res.json({auth: false, message: "Wrong mail/password combination!"})
  //       })
  //     }
  //     else res.json({auth: false, message: "This mail isnt registered!"})
  //   }
  // )
})

export default {
  path: '/api',
  handler: app,
  middleware: 'auth',
}

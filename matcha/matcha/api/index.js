const express = require('express')

const bcrypt = require('bcrypt')
const saltRounds = 10

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

app.get('/login', (req, res) => {
  console.log('You tried to login')
  res.send('You tried to login')
})

app.post('/register', (req, res) => {
  console.log(req.body)

  const firstName = req.body.first_name
  const lastName = req.body.last_name
  const userName = req.body.user_name
  const email = req.body.email
  const password = req.body.password
  const gender = req.body.gender

  // bcrypt.hash(password, saltRounds, (err, hash) => {
  // db.query(
  //   "INSERT INTO users (first_name, last_name, user_name, email, password, gender) VALUES ('milos','milos','milos','milos','milos',0)",
  //   [],
  //   // [firstName, lastName, userName, email, password, gender],
  //   (err, result) => {
  //     if (err) {
  //       console.log(err);
  //       console.log("sup lil bitch2");
  //     }
  //     else{
  //       console.log("sup lil bitch");
  //       res.sendStatus(200);
  //     }
  //   }
  // )
  const sql = `INSERT INTO users 
            (
              first_name, last_name, user_name, email, password, gender
            )
            VALUES
            (
                $1, $2, $3, $4, $5, $6
            )`
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

  // db.none('INSERT INTO users(name, active) VALUES($1, $2)', ['John', true])
  //     .then(() => {
  //         // success;
  //     })
  //     .catch(error => {
  //         // error;
  //     });
})

export default {
  path: '/api',
  handler: app,
  middleware: 'auth',
}

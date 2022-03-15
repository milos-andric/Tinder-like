const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const saltRounds = 10;

require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const db = require('../api/connect');

const generateAccessToken = user => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1y' });
};

// Post Routes

app.post('/register', (req, res) => {
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const userName = req.body.user_name;
  const email = req.body.email;
  const gender = req.body.gender;

  const sql = `INSERT INTO users
            ( first_name, last_name, user_name, email, password, gender )
            VALUES ( $1, $2, $3, $4, $5, $6 )`;
  bcrypt
    .hash(req.body.password, saltRounds)
    .then(function (password) {
      db.none(
        sql,
        [firstName, lastName, userName, email, password, gender],
        function (err, data) {
          if (err) {
            // some error occured
            res.sendStatus(500);
          } else {
            // successfully inserted into db
            // todo login direct lol
            res.sendStatus(200);
          }
        }
      )
        .then(() => {
          // success;
          res.sendStatus(200);
        })
        .catch(e => {
          res.sendStatus(500);
          // error;
        });
    })
    .catch(e => {
      res.sendStatus(500);
      // error;
    });
});

app.post('/login', (req, res) => {

  db.one('SELECT * FROM users WHERE user_name = $1', req.body.username)
    .then(function (data) {
      bcrypt.compare(req.body.password, data.password, function (_err, result) {
        if (result === true) 
          res.send({ msg: 'Success', token: generateAccessToken(data) });
        else
          res.status(403).send({ msg: 'Invalid password' });
      });
    })
    .catch(function (_error) {
      res.status(403).send({ msg: 'User is not found' });
    });

});

app.post('/recover', (req, res) => {
  db.one('SELECT * FROM users WHERE user_name = $1', req.body.username).then((data) => {
    res.status(200).send({ msg: 'TODO' });
  })
  .catch(e => {
    res.status(403).send({ msg: 'User is not found' });
  });
});

app.post('/logout', (req, res) => {
  res.send({ msg: 'Successfully logged out' });
});

app.get('/user', (req, res) => {
  console.log(req.body);

  const email = req.body.email;

  db.one('SELECT * FROM users WHERE email = $1', email).then(
    function (data) {
      res.send(data);
    }.catch(function (_error) {
      // error;
      res.status(403).send({ token: null, msg: 'User is not found' });
    })
  );
});

export default {
  path: '/api',
  handler: app,
};

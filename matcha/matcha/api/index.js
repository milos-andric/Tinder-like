const express = require('express');
const { body, validationResult } = require('express-validator');
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

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
}

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
        else res.status(403).send({ msg: 'Invalid password' });
      });
    })
    .catch(function (_error) {
      res.status(403).send({ msg: 'User is not found' });
    });
});

app.post('/recover', (req, res) => {
  db.one('SELECT * FROM users WHERE user_name = $1', req.body.username)
    .then(data => {
      res.status(200).send({ msg: 'TODO' });
    })
    .catch(e => {
      res.status(403).send({ msg: 'User is not found' });
    });
});

app.post(
  '/updateUserInfo',
  authenticateToken,
  body('first_name')
    .trim()
    .isLength({ min: 3, max: 16 })
    .withMessage('First name must be at between 3 and 16 chars long'),
  body('last_name')
    .trim()
    .isLength({ min: 3, max: 16 })
    .withMessage('Last name must be at between 3 and 16 chars long'),
  body('user_name')
    .trim()
    .isLength({ min: 3, max: 16 })
    .withMessage('Username must be at between 3 and 16 chars long'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid mail address'),
  body('gender').isInt({ min: 0, max: 1 }),
  body('orientation').isInt({ min: 0, max: 2 }),
  body('bio')
    .trim()
    .isLength({ max: 255 })
    .withMessage('Bio must be shorter than 255 chars long'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const sql = `UPDATE users SET 
            ( first_name, last_name, user_name, email, gender, orientation, bio, tags )
            = ( $1, $2, $3, $4, $5, $6, $7, $8 ) WHERE user_id=$9`;

    db.none(sql, [
      req.body.first_name,
      req.body.last_name,
      req.body.user_name,
      req.body.email,
      req.body.gender,
      req.body.orientation,
      req.body.bio,
      req.body.tags,
      req.user.user_id,
    ])
      .then(data => res.status(200).json(data))
      .catch(() => res.status(400).json({ msg: 'Database error' }));
  }
);

app.post('/logout', (req, res) => {
  res.status(200).send({ msg: 'Successfully logged out' });
});

app.get('/user', authenticateToken, (req, res) => {
  db.one('SELECT * FROM users WHERE user_id = $1', req.user.user_id)
    .then(function (data) {
      delete data.password;
      res.status(200).json(data);
    })
    .catch(function (_error) {
      res.status(404).json({ msg: 'User is not found' });
    });
});

export default {
  path: '/api',
  handler: app,
};

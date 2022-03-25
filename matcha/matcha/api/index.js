// import { resetAutoDestroyState } from '@vue/test-utils';
import buildFactory from '../model/factory';

const path = require('path');
const fs = require('fs');

const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const uuid = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 10;

require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ createParentPath: true }));

const pgp = require('pg-promise')(/* options */);
const db = require('./connect');

// Functions
// const db = pgp('postgres://postgres:changeme@postgres:5432/matcha_db');
// const pgp = require('./connect').pgp;

const generateAccessToken = user => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1y' });
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'camagru.tmarcon@gmail.com',
    pass: 'lyvrjuzmmccoyuuw',
  },
});

// Routes middleware

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
};

const validateInput = (data, msg) => {
  return (req, res, next) => {
    const input = req.body[data].trim();
    if (!(input.length >= 3 && input.length <= 16))
      return res.status(400).json({ msg });
    if (
      !input.match(
        /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
      )
    )
      return res.status(400).json({ msg: 'Invalid username' });

    next();
  };
};

const validateEmail = data => {
  return (req, res, next) => {
    const input = req.body[data].trim();

    if (
      input.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    )
      next();
    else return res.status(400).json({ msg: 'Invalid mail address' });
  };
};

const validatePassword = (data, msg) => {
  return (req, res, next) => {
    const input = req.body[data];

    if (
      input.length >= 8 &&
      input.match(/[A-Z]/) &&
      input.match(/[a-z]/) &&
      input.match(/[0-9]/)
    )
      next();
    else return res.status(400).json({ msg });
  };
};

const validateInt = (data, min, max) => {
  return (req, res, next) => {
    const input = req.body[data];

    if (input >= min && input <= max) next();
    else return res.status(400).json({ msg: 'Invalid input' });
  };
};

const validateText = (data, max, msg) => {
  return (req, res, next) => {
    const input = req.body[data].trim();

    if (input <= max) next();
    else return res.status(400).json({ msg });
  };
};

// POST routes

app.post(
  '/register',
  validateInput(
    'first_name',
    'First name must be at between 3 and 16 chars long'
  ),
  validateInput(
    'last_name',
    'Last name must be at between 3 and 16 chars long'
  ),
  validateInput('user_name', 'Username must be at between 3 and 16 chars long'),
  validateEmail('email'),
  validateInt('gender', 0, 1),
  validatePassword(
    'password',
    'Password must contains at least 8 chars, 1 lowercase, 1 uppercase and 1 number'
  ),
  (req, res) => {
    const sql = `INSERT INTO users
            ( first_name, last_name, user_name, email, password, gender, activation_code )
            VALUES ( $1, $2, $3, $4, $5, $6, $7 ) RETURNING user_id`;

    const activationCode = uuid.v1();

    bcrypt.hash(req.body.password, saltRounds).then(function (hash) {
      db.one(sql, [
        req.body.first_name,
        req.body.last_name,
        req.body.user_name,
        req.body.email,
        hash,
        req.body.gender,
        activationCode,
      ])
        .then(data => {
          const link =
            'http://localhost:8000/activate?user_id=' +
            data.user_id +
            '&code=' +
            activationCode;

          const mailOptions = {
            from: 'Matcha <camagru.tmarcon@gmail.com>',
            to: req.body.email,
            subject: 'Account Activation Required',
            html:
              '<p>Please click the following link to activate your account: <a href="' +
              link +
              '">' +
              link +
              '</a></p>',
          };
          transporter.sendMail(mailOptions);

          res.sendStatus(200);
        })
        .catch(() => res.status(400).json({ msg: 'User already exists' }));
    });
  }
);

app.post('/activate', (req, res) => {
  db.one(
    'UPDATE users SET activation_code=$1 WHERE user_id=$2 AND activation_code=$3 RETURNING activation_code',
    ['activated', req.body.user_id, req.body.code]
  )
    .then(data => {
      if (data.activation_code === 'activated')
        res.status(200).send({ msg: 'Account activated' });
      else res.status(403).send({ msg: 'User is not found' });
    })
    .catch(e => {
      res.status(403).send({ msg: 'User is not found' });
    });
});

app.post('/login', (req, res) => {
  db.one('SELECT * FROM users WHERE user_name = $1', req.body.username)
    .then(function (data) {
      if (data.activation_code === 'activated') {
        bcrypt.compare(
          req.body.password,
          data.password,
          function (_err, result) {
            if (result === true)
              res.send({ msg: 'Success', token: generateAccessToken(data) });
            else res.status(403).send({ msg: 'Invalid password' });
          }
        );
      } else res.status(403).send({ msg: "Account isn't activated" });
    })
    .catch(function (_error) {
      res.status(403).send({ msg: 'User is not found' });
    });
});

app.post('/recover', validateEmail('email'), (req, res) => {
  const newPass = uuid.v4();

  bcrypt.hash(newPass, saltRounds).then(function (hash) {
    db.one('UPDATE users SET password=$1 WHERE email=$2 RETURNING user_id', [
      hash,
      req.body.email,
    ])
      .then(data => {
        if (data) {
          const mailOptions = {
            from: 'Matcha <camagru.tmarcon@gmail.com>',
            to: req.body.email,
            subject: 'Password recovery',
            html:
              '<p>Please use the following password to log into your account: ' +
              newPass +
              '</p>',
          };
          transporter.sendMail(mailOptions);

          res.status(200).send({ msg: 'Success' });
        } else res.status(403).send({ msg: 'User is not found' });
      })
      .catch(e => res.status(403).send({ msg: 'User is not found' }));
  });
});

app.post(
  '/updateUserInfo',
  authenticateToken,
  validateInput(
    'first_name',
    'First name must be at between 3 and 16 chars long'
  ),
  validateInput(
    'last_name',
    'Last name must be at between 3 and 16 chars long'
  ),
  validateInput('user_name', 'Username must be at between 3 and 16 chars long'),
  validateEmail('email'),
  validateInt('gender', 0, 1),
  validateInt('orientation', 0, 2),
  validatePassword(
    'password',
    'Password must contains at least 8 chars, 1 lowercase, 1 uppercase and 1 number'
  ),
  validateText('bio', 255, 'Bio must be shorter than 255 chars long'),
  (req, res) => {
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

app.post(
  '/changePassword',
  authenticateToken,
  validatePassword(
    'newPass',
    'Password must contains at least 8 chars, 1 lowercase, 1 uppercase and 1 number'
  ),
  (req, res) => {
    if (req.body.newPass !== req.body.secPass)
      return res
        .status(400)
        .send({ msg: 'Password confirmation does not match password' });

    // Get and check current user's pass
    db.one(`SELECT * FROM users WHERE user_id=$1`, req.user.user_id)
      .then(data => {
        bcrypt.compare(
          req.body.oldPass,
          data.password,
          function (_err, result) {
            if (result === true) {
              // Update user's pass
              bcrypt.hash(req.body.newPass, saltRounds).then(hash => {
                db.none(`UPDATE users SET password=$1 WHERE user_id=$2`, [
                  hash,
                  req.user.user_id,
                ])
                  .then(() => res.sendStatus(200))
                  .catch(() =>
                    res.status(400).json({ msg: 'Database error 2' })
                  );
              });
            } else res.status(403).json({ msg: 'Invalid current password' });
          }
        );
      })
      .catch(() => res.status(400).json({ msg: 'Database error 1' }));
  }
);

app.post('/upload-image', authenticateToken, (req, res) => {
  if (!req.files)
    return res.status(400).json({ msg: 'No files were uploaded.' });

  const image = req.files.image;
  const imageExt = path.extname(image.name);
  const imagePath = '/uploads/' + req.user.user_id + '/' + uuid.v1() + imageExt;
  const allowedExt = ['.png', '.jpg', '.jpeg'];

  if (!allowedExt.includes(imageExt))
    return res.status(422).json({ msg: 'Invalid Image' });

  image.mv('./static' + imagePath, e => {
    if (e) return res.status(400).json({ msg: "Couldn't upload image" });

    db.query(`SELECT * FROM images WHERE user_id=$1`, req.user.user_id)
      .then(data => {
        if (data && data.length < 5) {
          db.none(`INSERT INTO images ( url, user_id ) VALUES ( $1, $2 )`, [
            imagePath,
            req.user.user_id,
          ]);
          return res.status(200).json({ msg: 'Success', path: imagePath });
        } else
          return res.status(400).json({ msg: "Can't have more than 5 images" });
      })
      .catch(e => {
        return res.status(400).json({ msg: 'Database error' });
      });
  });
});

app.post('/delete-image', authenticateToken, (req, res) => {
  db.none('DELETE FROM images WHERE user_id = $1 AND image_id = $2', [
    req.user.user_id,
    req.body.id,
  ])
    .then(() => {
      fs.unlink('static' + req.body.url, err => {
        if (err) return res.status(400).json({ msg: 'Image not found' });
      });
      res.status(200).json({ msg: 'Success' });
    })
    .catch(() => res.status(400).json({ msg: 'Image not found' }));
});

app.post('/profile-image', authenticateToken, (req, res) => {
  const image = req.body.image ? req.body.image.image_id : null;
  db.none(`UPDATE users SET profile_pic=$1 WHERE user_id=$2`, [
    image,
    req.user.user_id,
  ])
    .then(() => {
      res.status(200).json({ msg: 'Success' });
    })
    .catch(() => res.status(400).json({ msg: 'Failure' }));
});

app.post('/logout', (req, res) => {
  res.status(200).json({ msg: 'Successfully logged out' });
});

// GET routes

const getUserInfos = async id => {
  try {
    const data = await db.one('SELECT * FROM users WHERE user_id = ' + id);
    delete data.password;
    return data;
  } catch (e) {
    throw new Error('User is not found');
  }
};

app.get('/user/:user_id?', authenticateToken, async (req, res) => {
  let id = req.user.user_id;
  if (req.params && req.params.user_id) id = req.params.user_id;

  try {
    const user = await getUserInfos(id);
    return res.status(200).json(user);
  } catch (e) {
    return res.status(404).json({ msg: e });
  }
});

app.get('/user-images/:user_id?', authenticateToken, (req, res) => {
  let id = req.user.user_id;
  if (req.params && req.params.user_id) id = req.params.user_id;
  db.many('SELECT * FROM images WHERE user_id = $1', id)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (_error) {
      res.status(200).json({ data: [] });
    });
});

app.post('/search', (req, res) => {
  // console.log(req.body);
  // sanitize all inputs.
  // verify no additional data
  // verify data type value
  // search db

  let sql = 'SELECT * FROM users';
  const values = [];
  if (Object.keys(req.body.searchObj).length > 0) {
    let counter = 0;
    sql += ' WHERE';
    if (req.body.searchObj.last_name) {
      counter++;
      if (counter > 1) {
        sql += ' AND';
      }
      sql += ' last_name LIKE $' + counter + '';
      const lastName = '%' + req.body.searchObj.last_name + '%';
      values.push(lastName);
    }
    if (req.body.searchObj.first_name) {
      counter++;
      if (counter > 1) {
        sql += ' AND';
      }
      sql += ' first_name LIKE $' + counter + '';
      const firstName = '%' + req.body.searchObj.first_name + '%';
      values.push(firstName);
    }
    if (req.body.searchObj.age) {
      counter++;
      if (counter > 1) {
        sql += ' AND';
      }
      sql += ' age BETWEEN' + ' $' + counter;
      counter++;
      sql += ' AND' + ' $' + counter;
      values.push(req.body.searchObj.age[0]);
      values.push(req.body.searchObj.age[1]);
    }
    // if (req.body.searchObj.location) {
    //   counter++;
    //   if (counter > 1) {
    //     sql += ' AND';
    //   }
    //   sql += '  =' + ' $' + counter;
    // }
    if (req.body.searchObj.fame) {
      counter++;
      if (counter > 1) {
        sql += ' AND';
      }
      sql += ' fame >=' + ' $' + counter;
      values.push(req.body.searchObj.fame);
    }
    db.any(sql, values).then(function (data) {
      res.send(data);
    });
  }
});

app.post('/registerMany', async (req, res) => {
  const factory = buildFactory();
  const sql = await factory.attrsMany('User', 200).then(user => {
    const ret = pgp.helpers.insert(
      user,
      [
        'first_name',
        'last_name',
        'user_name',
        'email',
        'password',
        'gender',
        'score',
        'bio',
        'age',
        'activation_code',
      ],
      'users'
    );
    return ret;
  });
  db.any(sql).then(function (data) {
    res.sendStatus(200);
  });
});

app.post('/like', authenticateToken, async (req, res) => {
  const targetId = req.body.data.targetId;
  const user = await getUserInfos(req.user.user_id);
  if (user.user_id === targetId)
    return res.status(400).json({ msg: 'You cannot like yourself' });

  const data = await db.any(
    'SELECT * FROM likes WHERE liker_id = $1 AND target_id = $2',
    [user.user_id, targetId]
  );
  if (data.length !== 0)
    return res.status(400).json({ msg: 'User already liked' });

  const sql = `INSERT INTO likes ( liker_id, target_id ) VALUES ( $1, $2 )`;
  await db.any(sql, [user.user_id, targetId]).catch(err => {
    res.status(500).json(err);
  });
  res.sendStatus(200);
});

app.post('/view', authenticateToken, async (req, res) => {
  const targetId = req.body.data.targetId;
  const user = await getUserInfos(req.user.user_id);
  if (user.user_id === targetId)
    return res.status(400).json({ msg: 'You cannot react to yourself' });

  const data = await db.any(
    'SELECT * FROM views WHERE viewer_id = $1 AND target_id = $2',
    [user.user_id, targetId]
  );
  if (data.length !== 0)
    return res.status(400).json({ msg: 'User already scored' });

  const sql = `INSERT INTO views ( viewer_id, target_id ) VALUES ( $1, $2 )`;
  await db.any(sql, [user.user_id, targetId]).catch(err => {
    res.status(500).json(err);
  });
  res.sendStatus(200);
});

const findPartner = async user => {
  let sql = `SELECT * FROM users WHERE`;
  if (user.orientation !== 2) {
    sql += ` gender = ${user.orientation} AND`;
  }
  sql += ` user_id NOT IN (SELECT target_id FROM likes WHERE liker_id = ${user.user_id})`;
  sql += ` AND user_id NOT IN (SELECT target_id FROM views WHERE viewer_id = ${user.user_id})`;
  sql += ` AND user_id != ${user.user_id}`;
  sql += ` ORDER BY score DESC`;
  const res = await db.many(sql).catch(r => {
    return null;
  });
  if (res) {
    delete res[0].password;
    return res[0];
  } else {
    return null;
  }
};

app.post('/getRecommandation', authenticateToken, async (req, res) => {
  const user = await getUserInfos(req.user.user_id);
  const partner = await findPartner(user);
  if (partner) {
    res.send(partner);
  } else {
    res.send(null);
  }
});

export default {
  path: '/api',
  handler: app,
};

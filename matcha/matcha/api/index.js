// File managment
import * as path from 'path';
import * as fs from 'fs';
import fileUpload from 'express-fileupload';

// Credentials
import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';
import * as bcrypt from 'bcrypt';

// Location
import nearbyCities from 'nearby-cities';
import WorldCities from 'worldcities';

// Core
import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import express from 'express';
import pgPromise from 'pg-promise';
import { Server } from 'socket.io';
import buildFactory from '../model/factory';

import {
  validateInput,
  validateUsername,
  validateEmail,
  validateInt,
  validatePassword,
  validateText,
  validateAge,
  validateTags,
} from './validator';

const pgp = pgPromise();
const db = pgp('postgres://postgres:changeme@postgres:5432/matcha_db');

const app = express();
const saltRounds = 10;
dotenv.config();
global.db = db;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ createParentPath: true }));

// if (process.env.NODE_ENV === 'production') {
// registerUsers();
// }

const users = [];
const http = require('http');
const { lookup } = require('geoip-lite');
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

function socketIdentification(socket) {
  const token = socket.handshake.auth.token.split(' ')[1];
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log(`${socket.id} is disconnected because bad token !`);
      socket.disconnect(true);
    } else {
      console.log(`${socket.id} is identified ! as ` + user.user_name);
      return user;
    }
  });
}

function emitNotifications(socketIds, notif) {
  socketIds.forEach(element => {
    io.to(element).emit('receiveNotification', notif);
  });
}

function getSocketById(userId) {
  const socketList = users
    .filter(e => Number(e.user_id) === Number(userId))
    .map(e => e.socket_id);
  return socketList;
}

async function userIsBlocked(senderId, blockedId) {
  const senderIdInt = Number(senderId);
  const blockedIdInt = Number(blockedId);
  const data = await db.manyOrNone(
    `SELECT * FROM blocks WHERE sender_id=$1 AND blocked_id=$2`,
    [senderIdInt, blockedIdInt]
  );
  if (data.length > 0) {
    return true;
  }
  return false;
}

async function sendNotification(myId, targetId, typeNotif) {
  try {
    const myIdInt = Number(myId);
    const targetIdInt = Number(targetId);
    const typeNotifString = String(typeNotif);
    if ((await userIsBlocked(targetIdInt, myIdInt)) === true) return;
    const alreadyNotified = await db.oneOrNone(
      `SELECT * FROM notifications WHERE type=$1 AND user_id_send=$2 AND user_id_receiver=$3 AND watched=$4`,
      [typeNotifString, myIdInt, targetIdInt, false]
    );
    if (!alreadyNotified) {
      if (targetIdInt !== myIdInt) {
        const socketList = getSocketById(targetIdInt);
        const data = await postNotification(
          myIdInt,
          targetIdInt,
          typeNotifString
        );
        emitNotifications(socketList, data);
      }
    }
  } catch {
    throw new Error('notification fail');
  }
}

io.on('connection', socket => {
  console.log(`${socket.id} is connected to / by io !`);
  if (socket.handshake.auth?.token) {
    const user = socketIdentification(socket);
    if (user) {
      users.push({
        user_id: user.user_id,
        socket_id: socket.id,
      });
      io.emit(
        'online',
        users.map(e => e.user_id)
      );
    } else {
      socket.disconnect(true);
    }
  } else {
    socket.disconnect(true);
  }

  socket.on('disconnect', _reason => {
    const client = users.find(e => e.socket_id === socket.id);
    client.disconnectId = setTimeout(
      function () {
        const find = users.find(
          e => e.socket_id === client.socket_id && client.disconnectId
        );
        if (!find) clearTimeout(client.disconnectId);
        socket.disconnect(true);
        const index = users.findIndex(obj => obj.socket_id === socket.id);
        users.splice(index, 1);
        setLastConnexion(client.user_id);
        io.emit(
          'online',
          users.map(e => e.user_id)
        );
      },
      2000,
      client,
      socket
    );
  });
});
server.listen(3001);

// Functions

const generateAccessToken = user => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1y' });
};

async function registerUsers() {
  try {
    const factory = buildFactory();
    const sql = await factory.attrsMany('User', 500).then(user => {
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
          'orientation',
          'latitude',
          'longitude',
          'profile_pic',
        ],
        'users'
      );
      return ret;
    });
    await db.any(sql);
  } catch (e) {
    throw new Error('Generator users has failed.');
  }
}

const getUserTags = async id => {
  try {
    const ret = [];
    const sql =
      'SELECT t.label FROM user_tags u JOIN tags t ON t.tag_id=u.tag_id WHERE u.user_id=$1';
    const tags = await db.manyOrNone(sql, [id]);
    tags.forEach(e => ret.push(e.label));
    return ret;
  } catch (e) {
    return [];
  }
};

const getUserInfos = async id => {
  try {
    const data = await global.db.one(
      `SELECT user_id,
      first_name,
      last_name,
      user_name,
      age,
      gender,
      orientation,
      bio,
      profile_pic,
      score,
      latitude,
      longitude,
      privilege,
      last_connexion,
      created_on FROM users WHERE user_id = $1`,
      id
    );
    data.tags = await getUserTags(data.user_id);

    if (data.profile_pic)
      data.profile_pic = await global.db.oneOrNone(
        `SELECT
        image_id,
        url,
        user_id,
        created_on
        FROM images WHERE image_id = $1`,
        data.profile_pic
      );
    return data;
  } catch (e) {
    throw new Error('User is not found');
  }
};

const getUserInfosMe = async id => {
  try {
    const data = await global.db.one(
      `SELECT
      user_id,
      first_name,
      last_name,
      user_name,
      email,
      age,
      gender,
      orientation,
      bio,
      profile_pic,
      score,
      latitude,
      longitude,
      privilege,
      last_connexion,
      created_on
      FROM users WHERE user_id = $1`,
      id
    );
    data.tags = await getUserTags(data.user_id);

    if (data.profile_pic)
      data.profile_pic = await global.db.oneOrNone(
        `SELECT
        image_id,
        url,
        user_id,
        created_on
        FROM images WHERE image_id = $1`,
        data.profile_pic
      );
    return data;
  } catch (e) {
    throw new Error('User is not found');
  }
};

const getUserImages = async id => {
  try {
    return await global.db.any(
      `SELECT
      image_id,
      url,
      user_id,
      created_on
      FROM images WHERE user_id = $1`,
      id
    );
  } catch (e) {
    throw new Error('Database error');
  }
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
  validateUsername(
    'user_name',
    'Username must be at between 3 and 16 chars long'
  ),
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

    bcrypt.hash(req.body.password, saltRounds).then(hash => {
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

          return res.sendStatus(200);
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
        return res.status(200).send({ msg: 'Account activated' });
      else return res.status(403).send({ msg: 'User is not found' });
    })
    .catch(e => {
      return res.status(403).send({ msg: 'User is not found' });
    });
});

app.post('/login', (req, res) => {
  db.one('SELECT * FROM users WHERE user_name = $1', req.body.username)
    .then(data => {
      if (data.activation_code === 'activated') {
        bcrypt.compare(req.body.password, data.password, (_err, result) => {
          if (result === true)
            return res.send({
              msg: 'Success',
              token: generateAccessToken(data),
            });
          else return res.status(403).send({ msg: 'Invalid password' });
        });
      } else return res.status(403).send({ msg: "Account isn't activated" });
    })
    .catch(_error => {
      return res.status(403).send({ msg: 'User is not found' });
    });
});

app.post('/recover', validateEmail('email'), (req, res) => {
  const newPass = uuid.v4();

  bcrypt.hash(newPass, saltRounds).then(hash => {
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

          return res.status(200).send({ msg: 'Success' });
        } else return res.status(403).send({ msg: 'User is not found' });
      })
      .catch(e => res.status(403).send({ msg: 'User is not found' }));
  });
});

function validateLocation() {
  return (req, res, next) => {
    const input = req.body.ville;
    if (input) {
      const ll = getLLFromCity(input);
      if (!ll) {
        return res.status(400).json({ msg: 'City not found' });
      } else {
        req.body.ll = ll;
      }
    } else {
      req.body.ll = [null, null];
    }
    next();
  };
}

const updateTags = async (userId, tags) => {
  // Add tags in tag list (they are unique so just ignore conflict)
  // If any db error it ll be catched later in /updateUserInfo so
  //    no need for try catch
  // We wont delete them even if unused tho i guess

  // /!\ tag primary key id seems to increment even on conflict ??

  const tagsId = [];

  await Promise.all(
    tags.map(async tag => {
      const newTagId = await db.one(
        `INSERT INTO tags (label) VALUES ($1)
          ON CONFLICT ON CONSTRAINT tags_label_key
          DO UPDATE SET label=$1 RETURNING tag_id`,
        [tag]
      );

      tagsId.push(newTagId.tag_id);
    })
  );

  // Add user relational tags (will be more difficult)
  //    - Delete all user's tags for less difficulty (dont hurt me robz)
  //    - Add new tags

  const currentTags = (
    await db.any('SELECT tag_id FROM user_tags WHERE user_id = $1', userId)
  ).map(e => {
    return e.tag_id;
  });

  const toDeleteTags = currentTags.filter(x => !tagsId.includes(x));
  const toAddTags = tagsId.filter(x => !currentTags.includes(x));

  await Promise.all(
    toDeleteTags.map(async tag => {
      await db.none(
        `DELETE FROM user_tags WHERE tag_id = $1 AND user_id = $2`,
        [tag, userId]
      );
    })
  );

  await Promise.all(
    toAddTags.map(async tag => {
      await db.none(`INSERT INTO user_tags (tag_id, user_id) VALUES ($1, $2)`, [
        tag,
        userId,
      ]);
    })
  );
};

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
  validateUsername(
    'user_name',
    'Username must be at between 3 and 16 chars long'
  ),
  validateLocation(),
  validateEmail('email'),
  validateAge('birth_date', 'You must be older than 18 yo'),
  validateInt('gender', 0, 1),
  validateInt('orientation', 0, 2),
  validateText('bio', 255, 'Bio must be shorter than 255 chars long'),
  validateTags('tags', 'Invalid tag format'),
  async (req, res) => {
    try {
      const sql = `UPDATE users SET
            ( first_name, last_name, user_name, email, age, gender, orientation, bio, latitude, longitude )
            = ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) WHERE user_id=$11`;

      const data = await db.none(sql, [
        req.body.first_name,
        req.body.last_name,
        req.body.user_name,
        req.body.email,
        req.body.birth_date,
        req.body.gender,
        req.body.orientation,
        req.body.bio,
        req.body.ll[0],
        req.body.ll[1],
        req.user.user_id,
      ]);

      await updateTags(req.user.user_id, req.body.tags);

      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ msg: 'Database error' });
    }
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
    db.one(`SELECT password FROM users WHERE user_id=$1`, req.user.user_id)
      .then(data => {
        bcrypt.compare(req.body.oldPass, data.password, (_err, result) => {
          if (result === true) {
            // Update user's pass
            bcrypt.hash(req.body.newPass, saltRounds).then(hash => {
              db.none(`UPDATE users SET password=$1 WHERE user_id=$2`, [
                hash,
                req.user.user_id,
              ])
                .then(() => res.sendStatus(200))
                .catch(() => res.status(400).json({ msg: 'Database error 2' }));
            });
          } else
            return res.status(403).json({ msg: 'Invalid current password' });
        });
      })
      .catch(() => res.status(400).json({ msg: 'Database error 1' }));
  }
);

app.post('/upload-image', authenticateToken, (req, res) => {
  if (!req.files)
    return res.status(400).json({ msg: 'No files were uploaded.' });

  const image = req.files.image;
  if (image.size > 50000)
    return res.status(413).json({ msg: 'File too heavy.' });
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
  try {
    db.none('DELETE FROM images WHERE user_id = $1 AND image_id = $2', [
      req.user.user_id,
      req.body.id,
    ]);
    db.any(
      'UPDATE users SET profile_pic = NULL WHERE user_id = $1 AND profile_pic = $2',
      [req.user.user_id, req.body.id]
    );
    fs.unlink('static' + req.body.url, () => {});
    return res.status(200).json({ msg: 'Success' });
  } catch (e) {
    return res.status(400).json({ msg: 'Image not found' });
  }
});

app.post('/profile-image', authenticateToken, async (req, res) => {
  try {
    await db.none(`UPDATE users SET profile_pic=$1 WHERE user_id=$2`, [
      req.body.image ? req.body.image.image_id : null,
      req.user.user_id,
    ]);
    return res.status(200).json({ msg: 'Success' });
  } catch (e) {
    return res.status(400).json({ msg: 'Failure' });
  }
});

function setLastConnexion(id) {
  return db.none(`UPDATE users SET last_connexion=$1 WHERE user_id=$2`, [
    new Date(),
    id,
  ]);
}

app.post('/logout', authenticateToken, async (req, res) => {
  try {
    await setLastConnexion(req.user.user_id);
    return res.status(200).json({ msg: 'Successfully logged out' });
  } catch (e) {
    return res.status(403).send({ msg: 'User is not found' });
  }
});

// User actions

app.post('/user-block', authenticateToken, async (req, res) => {
  const sender = req.user.user_id;
  const receiver = req.body.receiver;

  if (sender === receiver)
    return res.status(200).json({ msg: 'You cannot block yourself' });

  try {
    const data = await db.any(
      'SELECT * FROM blocks WHERE sender_id = $1 AND blocked_id = $2',
      [sender, receiver]
    );
    if (data.length !== 0)
      return res.status(200).json({ msg: 'User already blocked' });
    await db.none(
      'INSERT INTO blocks ( sender_id, blocked_id ) VALUES ( $1, $2 )',
      [sender, receiver]
    );
    return res.status(200).json({ msg: 'Successfully blocked user' });
  } catch (e) {
    return res.status(400).json({ msg: "Couldn't block user" });
  }
});

app.post('/user-report', authenticateToken, async (req, res) => {
  const sender = req.user.user_id;
  const receiver = req.body.receiver;

  if (sender === receiver)
    return res.status(200).json({ msg: 'You cannot report yourself' });

  try {
    const data = await db.any(
      'SELECT * FROM reports WHERE sender_id = $1 AND reported_id = $2',
      [sender, receiver]
    );
    if (data.length !== 0)
      return res.status(200).json({ msg: 'User already reported' });
    await db.none(
      'INSERT INTO reports ( sender_id, reported_id ) VALUES ( $1, $2 )',
      [sender, receiver]
    );
    return res.status(200).json({ msg: 'Successfully reported user' });
  } catch (e) {
    return res.status(400).json({ msg: "Couldn't report user" });
  }
});

app.post('/getRandomTags', authenticateToken, async (req, res) => {
  try {
    const sql = `SELECT label FROM tags ORDER BY random() LIMIT $1`;
    const tags = await db.manyOrNone(sql, [req.body.number]);
    if (tags.length === 0) return res.status(200).json({ tags: ['chien'] });
    res.status(200).json({ tags });
  } catch (_e) {
    return res.status(500);
  }
});

// GET routes

function getCityFromLL(latitude, longitude) {
  const query = { latitude, longitude };
  try {
    const cities = nearbyCities(query);
    if (!cities) {
      return undefined;
    } else if (cities.length) {
      return cities[0].name;
    }
  } catch (error) {
    console.log(error);
  }
}
function getLLFromCity(city) {
  let res = WorldCities.getAllByName(city);
  res = res.sort((a, b) => b.population - a.population);
  if (res.length) {
    return [res[0].latitude, res[0].longitude];
  }
  return undefined;
}
app.get('/me', authenticateToken, async (req, res) => {
  const id = req.user.user_id;
  try {
    const user = await getUserInfosMe(id);
    if (user.latitude && user.longitude) {
      user.ville = getCityFromLL(user.latitude, user.longitude);
    }
    return res.status(200).json(user);
  } catch (e) {
    return res.status(404).json({ msg: e });
  }
});

app.get('/user/:user_id', authenticateToken, async (req, res) => {
  const myId = req.user.user_id;
  let targetId;
  if (req.params && req.params.user_id) targetId = req.params.user_id;
  try {
    const user = await getUserInfos(targetId);
    user.last_connexion = timeDifference(user.last_connexion);
    await sendNotification(myId, targetId, 'view');
    await recalculUserScore(targetId);
    return res.status(200).json(user);
  } catch (e) {
    return res.status(404).json({ msg: e });
  }
});

app.get('/is-liked/:target_id', authenticateToken, async (req, res) => {
  const myIdInt = Number(req.user.user_id);
  const targetIdInt = Number(req.params.target_id);
  try {
    const liked = await db.manyOrNone(
      'SELECT * FROM likes WHERE liker_id=$1 AND target_id=$2',
      [myIdInt, targetIdInt]
    );
    if (liked && liked.length) {
      return res.status(200).json(true);
    } else {
      return res.status(200).json(false);
    }
  } catch (e) {
    return res.status(404).json({ msg: e });
  }
});

app.get('/user-images/:user_id?', authenticateToken, async (req, res) => {
  let id = req.user.user_id;
  if (req.params && req.params.user_id) id = req.params.user_id;

  try {
    const images = await getUserImages(id);
    return res.status(200).json(images);
  } catch (e) {
    return res.status(404).json({ msg: e });
  }
});

app.get(
  '/user-informations/:target_id',
  authenticateToken,
  async (req, res) => {
    const myIdInt = Number(req.user.user_id);
    const targetIdInt = Number(req.params.target_id);
    try {
      const liked = await db.oneOrNone(
        'SELECT * FROM likes WHERE liker_id=$1 AND target_id=$2',
        [targetIdInt, myIdInt]
      );
      let matched = false;
      if (liked) {
        matched = await db.oneOrNone(
          'SELECT * FROM likes WHERE liker_id=$1 AND target_id=$2',
          [myIdInt, targetIdInt]
        );
      }
      const ret = {
        liked: false,
        matched: false,
      };
      if (liked) {
        ret.liked = true;
      }
      if (matched) {
        ret.matched = true;
      }
      return res.status(200).json(ret);
    } catch (e) {
      return res.status(404).json({ msg: e });
    }
  }
);

const idToUsername = async id => {
  const user = await getUserInfos(id);
  return user.user_name;
};

const isIdInRoom = async (id, room) => {
  const sql =
    'SELECT * FROM chats WHERE first_id = $1 OR second_id = $1 AND name = $2';
  const res = await db.manyOrNone(sql, [id, room]);
  if (res.length) {
    return true;
  } else {
    return false;
  }
};

app.post('/getRoomMessages', authenticateToken, async (req, res) => {
  try {
    if (await isIdInRoom(req.user.user_id, req.body.room)) {
      const sql = `SELECT messages.*,users.user_id,users.first_name,users.last_name,users.user_name,users.profile_pic,users.last_connexion
     FROM messages JOIN users ON messages.sender_id=users.user_id WHERE chat_id = $1 ORDER BY messages.created_on`;
      const messages = await db.manyOrNone(sql, [req.body.room]);
      return res.send(messages);
    } else return res.sendStatus(403);
  } catch (e) {
    return res.sendStatus(500).json({ msg: e });
  }
});

function emitMessages(socketIds, mess) {
  // require because old way to emit works for "individual socket" and no all socket for one user
  socketIds.forEach(element => {
    io.to(element).emit('receiveChatMessage', mess);
  });
}

const sendMessage = (myId, targetId, data) => {
  const senderListSocket = getSocketById(myId);
  const receiverListSocket = getSocketById(targetId);
  if (senderListSocket.length) {
    emitMessages(senderListSocket, data);
  }
  if (receiverListSocket.length) {
    emitMessages(receiverListSocket, data);
  }
};

function attributionRoomMessage(req, roomname) {
  const names = roomname.split('-');
  let receiverId = '0';
  let senderId = '0';
  Number(names[0]) !== req.user.user_id
    ? (receiverId = names[0])
    : (receiverId = names[1]);
  Number(names[0]) === req.user.user_id
    ? (senderId = names[0])
    : (senderId = names[1]);
  return [senderId, receiverId];
}

app.post('/sendRoomMessages', authenticateToken, async (req, res) => {
  if (!req.body.room || !req.body.message) {
    return res.sendStatus(400);
  }
  try {
    const [senderId, receiverId] = attributionRoomMessage(req, req.body.room);
    if ((await userIsBlocked(receiverId, senderId)) === true)
      return res.sendStatus(200);
    if ((await userIsBlocked(senderId, receiverId)) === true)
      return res.sendStatus(200);
    if (
      (await isIdInRoom(req.user.user_id, req.body.room)) &&
      req.body.message.length > 0
    ) {
      const sql = `INSERT into messages  ( "sender_id", "chat_id", "message", "created_on") VALUES ($1, $2, $3, NOW())`;
      await db.any(sql, [req.user.user_id, req.body.room, req.body.message]);
      const data = {
        sender_id: (await getUserInfos(req.user.user_id)).user_id,
        user_name: (await getUserInfos(req.user.user_id)).user_name,
        chat_id: req.body.room,
        message: req.body.message,
        type: 1,
      };
      await sendNotification(senderId, receiverId, 'message');
      sendMessage(senderId, receiverId, data);
      return res.send(data);
    } else {
      return res.sendStatus(403);
    }
  } catch (e) {
    return res.sendStatus(500).json({ msg: e });
  }
});

app.get('/getAvailableRooms', authenticateToken, async (req, res) => {
  try {
    const sql = 'SELECT * FROM chats WHERE first_id = $1 OR second_id = $1';
    const rooms = await db.manyOrNone(sql, [req.user.user_id]);
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].first_id === req.user.user_id) {
        rooms[i].pal_name = await idToUsername(rooms[i].second_id);
        rooms[i].pal_id = rooms[i].second_id;
        rooms[i].pal_img = (await getUserInfos(rooms[i].second_id)).profile_pic;
      } else {
        rooms[i].pal_name = await idToUsername(rooms[i].first_id);
        rooms[i].pal_id = rooms[i].first_id;
        rooms[i].pal_img = (await getUserInfos(rooms[i].first_id)).profile_pic;
      }
    }
    return res.send(rooms);
  } catch (e) {
    return res.sendStatus(500).json({ msg: e });
  }
});

function timeDifference(date) {
  const nowTime = Date.now();
  let difference = nowTime - date.getTime();

  const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
  difference -= daysDifference * 1000 * 60 * 60 * 24;

  const hoursDifference = Math.floor(difference / 1000 / 60 / 60);
  difference -= hoursDifference * 1000 * 60 * 60;

  const minutesDifference = Math.floor(difference / 1000 / 60);
  difference -= minutesDifference * 1000 * 60;

  const secondsDifference = Math.floor(difference / 1000);

  if (daysDifference) {
    return `${daysDifference} day(s) ago`;
  } else if (hoursDifference) {
    return `${hoursDifference} hour(s)  ago`;
  } else if (minutesDifference) {
    return `${minutesDifference} minute(s) ago`;
  } else {
    return `${secondsDifference} second(s) ago`;
  }
}

app.post('/getUserLikeHistory', authenticateToken, async (req, res) => {
  try {
    const sql =
      'SELECT * FROM likes WHERE liker_id = $1 OR target_id = $1 ORDER BY created_on DESC';
    const entries = await db.manyOrNone(sql, [req.user.user_id]);
    const myName = await idToUsername(req.user.user_id);
    const data = [];
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].liker_id === req.user.user_id) {
        const tmp = await idToUsername(entries[i].target_id);
        data.push({
          message: `${myName} liked ${tmp} ${timeDifference(
            entries[i].created_on
          )}`,
          userid: '/user/' + entries[i].target_id,
        });
      } else {
        const tmp = await idToUsername(entries[i].liker_id);
        data.push({
          message: `${myName} got a like from ${tmp} ${timeDifference(
            entries[i].created_on
          )}`,
          userid: '/user/' + entries[i].liker_id,
        });
      }
    }
    return res.send(data);
  } catch (e) {
    return res.sendStatus(500).json({ msg: e });
  }
});

app.post('/getUserViewHistory', authenticateToken, async (req, res) => {
  try {
    const sql =
      'SELECT * FROM views WHERE viewer_id = $1 OR target_id = $1 ORDER BY created_on DESC';
    const entries = await db.manyOrNone(sql, [req.user.user_id]);
    const myName = await idToUsername(req.user.user_id);
    const data = [];
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].viewer_id === req.user.user_id) {
        const tmp = await idToUsername(entries[i].target_id);
        data.push({
          message: `${myName} viewed ${tmp}'s profile ${timeDifference(
            entries[i].created_on
          )}`,
          userid: '/user/' + entries[i].target_id,
        });
      } else {
        const tmp = await idToUsername(entries[i].viewer_id);
        data.push({
          message: `${myName} got a view from ${tmp} ${timeDifference(
            entries[i].created_on
          )}`,
          userid: '/user/' + entries[i].viewer_id,
        });
      }
    }
    return res.send(data);
  } catch (e) {
    return res.sendStatus(500).json({ msg: e });
  }
});

app.post('/getUserMatchHistory', authenticateToken, async (req, res) => {
  try {
    const sql =
      'SELECT * FROM chats WHERE first_id = $1 OR second_id = $1 ORDER BY created_on DESC';
    const entries = await db.manyOrNone(sql, [req.user.user_id]);
    const myName = await idToUsername(req.user.user_id);
    const data = [];
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].first_id === req.user.user_id) {
        const tmp = await idToUsername(entries[i].second_id);
        data.push({
          message: `${myName} got a match with ${tmp} ${timeDifference(
            entries[i].created_on
          )}`,
          userid: '/user/' + entries[i].second_id,
        });
      } else {
        const tmp = await idToUsername(entries[i].first_id);
        data.push({
          message: `${myName} got a match with ${tmp} ${timeDifference(
            entries[i].created_on
          )}`,
          userid: '/user/' + entries[i].first_id,
        });
      }
    }
    return res.send(data);
  } catch (e) {
    return res.sendStatus(500).json({ msg: e });
  }
});

app.post('/getUserBlockHistory', authenticateToken, async (req, res) => {
  try {
    const sql =
      'SELECT * FROM blocks WHERE sender_id = $1 OR blocked_id = $1 ORDER BY created_on DESC';
    const entries = await db.manyOrNone(sql, [req.user.user_id]);
    const myName = await idToUsername(req.user.user_id);
    const data = [];
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].sender_id === req.user.user_id) {
        const tmp = await idToUsername(entries[i].blocked_id);
        data.push({
          message: `${myName} blocked ${tmp} ${timeDifference(
            entries[i].created_on
          )}`,
          userid: '/user/' + entries[i].blocked_id,
        });
      } else {
        const tmp = await idToUsername(entries[i].sender_id);
        data.push({
          message: `${myName} was blocked by ${tmp} ${timeDifference(
            entries[i].created_on
          )}`,
          userid: '/user/' + entries[i].sender_id,
        });
      }
    }
    return res.send(data);
  } catch (e) {
    return res.sendStatus(500).json({ msg: e });
  }
});

app.post('/getUserReportHistory', authenticateToken, async (req, res) => {
  try {
    const sql =
      'SELECT * FROM reports WHERE sender_id = $1 OR reported_id = $1 ORDER BY created_on DESC';
    const entries = await db.manyOrNone(sql, [req.user.user_id]);
    const myName = await idToUsername(req.user.user_id);
    const data = [];
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].sender_id === req.user.user_id) {
        const tmp = await idToUsername(entries[i].reported_id);
        data.push({
          message: `${myName} reported ${tmp} ${timeDifference(
            entries[i].created_on
          )}`,
          userid: '/user/' + entries[i].reported_id,
        });
      } else {
        const tmp = await idToUsername(entries[i].sender_id);
        data.push({
          message: `${myName} was reported by ${tmp} ${timeDifference(
            entries[i].created_on
          )}`,
          userid: '/user/' + entries[i].sender_id,
        });
      }
    }
    return res.send(data);
  } catch (e) {
    return res.sendStatus(500).json({ msg: e });
  }
});

async function searchFilter(req, ids, ll) {
  let sql;
  if (req.body.search.distance && ids.length) {
    sql = `SELECT * FROM (SELECT user_id, (
      6371 *
      acos(cos(radians($3)) *
      cos(radians(users.latitude)) *
      cos(radians(users.longitude) -
      radians($4)) +
      sin(radians($3)) *
      sin(radians(users.latitude)))
      ) AS distance FROM users) al WHERE user_id IN ($1:csv) AND distance < $2`;
    ids = await db.any(sql, [ids, req.body.search.distance, ll[0], ll[1]]);
    ids = ids.map(e => e.user_id);
  }
  if (req.body.search.last_name && ids.length) {
    sql =
      'SELECT user_id FROM users WHERE user_id IN ($1:csv) AND last_name ILIKE $2';
    const lastName = '%' + req.body.search.last_name + '%';
    ids = await db.any(sql, [ids, lastName]);
    ids = ids.map(e => e.user_id);
  }
  if (req.body.search.first_name && ids.length) {
    sql =
      'SELECT user_id FROM users WHERE user_id IN ($1:csv) AND first_name ILIKE $2';
    const lastName = '%' + req.body.search.first_name + '%';
    ids = await db.any(sql, [ids, lastName]);
    ids = ids.map(e => e.user_id);
  }
  if (req.body.search.age && ids.length) {
    sql =
      'SELECT user_id FROM users WHERE user_id IN ($1:csv) AND age BETWEEN $2 AND $3';
    const maxDate = new Date();
    maxDate.setYear(maxDate.getFullYear() - req.body.search.age[0]);
    const minDate = new Date();
    minDate.setYear(minDate.getFullYear() - req.body.search.age[1]);
    ids = await db.any(sql, [ids, minDate, maxDate]);
    ids = ids.map(e => e.user_id);
  }
  if (req.body.search.fame && ids.length) {
    sql =
      'SELECT user_id FROM users WHERE user_id IN ($1:csv) AND score BETWEEN $2 AND $3';
    ids = await db.any(sql, [
      ids,
      req.body.search.fame[0],
      req.body.search.fame[1],
    ]);
    ids = ids.map(e => e.user_id);
  }
  if (req.body.search.tags && ids.length) {
    for (let i = 0; i < req.body.search.tags.length; i++) {
      sql = `SELECT * FROM users AS u
      JOIN user_tags AS uTag ON u.user_id = uTag.user_id
      JOIN tags AS tag ON tag.tag_id = uTag.tag_id
      WHERE u.user_id IN ($1:csv) AND tag.label LIKE $2`;
      const tags = req.body.search.tags;
      ids = await db.any(sql, [ids, tags[i]]);
      ids = ids.map(e => e.user_id);
    }
  }
  return ids;
}

app.post('/search', authenticateToken, async (req, res) => {
  // sanitize all inputs.
  // verify no additional data
  // verify data type value
  // search db
  try {
    if (!req.body.search) return res.status(404).json({ msg: 'No data found' });

    let ids = await db.any(
      `SELECT user_id FROM users
      WHERE users.user_id != $1
      AND NOT EXISTS (SELECT * FROM blocks v WHERE v.sender_id = $1 AND v.blocked_id = users.user_id)`,
      req.user.user_id
    );
    ids = ids.map(e => e.user_id);
    const ll = getLL(req.user, req.body.search.ip);
    ids = await searchFilter(req, ids, ll);
    const sql = `SELECT *,distance FROM (SELECT *, (
    6371 *
    acos(cos(radians($2)) *
    cos(radians(users.latitude)) *
    cos(radians(users.longitude) -
    radians($3)) +
    sin(radians($2)) *
    sin(radians(users.latitude)))
    ) AS distance FROM users) al WHERE user_id IN ($1:csv)`;
    if (ids.length) {
      const find = await db.any(sql, [ids, ll[0], ll[1]]);
      return res.status(200).send(find);
    } else return res.status(200).send([]);
  } catch (e) {
    return res.sendStatus(500).json({ msg: e });
  }
});

const calculatePonderation = async (req, ids, ll) => {
  const sql = `SELECT *,distance,(1000 - distance) * (score / 10) AS orderScore FROM (SELECT users.score, users.user_id, (
      6371 *
      acos(cos(radians($2)) *
      cos(radians(users.latitude)) *
      cos(radians(users.longitude) -
      radians($3)) +
      sin(radians($2)) *
      sin(radians(users.latitude)))
      ) AS distance FROM users WHERE users.user_id IN ($1:csv) ) al`;
  const resp = await db.manyOrNone(sql, [ids, ll[0], ll[1]]);

  let mytagsId = await db.any(
    `SELECT user_tag_id FROM user_tags WHERE user_id=$1`,
    req.user.user_id
  );
  mytagsId = mytagsId.map(e => e.user_tag_id);
  const idsTags = await db.any(
    `SELECT users.user_id,count(*) FROM user_tags INNER JOIN users ON users.user_id=user_tags.user_id
    WHERE user_tags.tag_id IN ($1:csv)  AND user_tags.user_id IN ($2:csv) group by users.user_id ORDER BY count`,
    [mytagsId, ids]
  );
  idsTags.forEach(e => {
    const coef = Number(e.count);
    for (let i = 0; i < resp.length; i++) {
      if (resp[i].user_id === e.user_id) {
        resp[i].orderscore *= coef + 1;
        break;
      }
    }
  });
  resp.sort((a, b) => (a.orderscore < b.orderscore ? 1 : -1));
  return resp;
};

app.post('/matchFilter', authenticateToken, async (req, res) => {
  try {
    if (!req.body.search) return res.status(404).json({ msg: 'No data found' });
    let ids = await db.any(
      `SELECT *
      FROM users u
      WHERE u.user_id != $1
      AND NOT EXISTS (SELECT * FROM views v WHERE v.viewer_id = $1 AND v.target_id = u.user_id)
      AND NOT EXISTS (SELECT * FROM blocks v WHERE v.sender_id = $1 AND v.blocked_id = u.user_id)
      AND NOT EXISTS (SELECT * FROM likes l WHERE l.liker_id = $1  AND l.target_id = u.user_id)`,
      req.user.user_id
    );
    ids = ids.map(e => e.user_id);
    const ll = getLL(req.user, req.body.search.ip);
    ids = await searchFilter(req, ids, ll);
    if (ids.length === 0) {
      return res.status(200).send([]);
    }

    let sql = `SELECT user_id,
    first_name,
    last_name,
    user_name,
    age,
    gender,
    orientation,
    bio,
    profile_pic,
    score,
    latitude,
    longitude,
    distance FROM (SELECT *, (
    6371 *
    acos(cos(radians($2)) *
    cos(radians(users.latitude)) *
    cos(radians(users.longitude) -
    radians($3)) +
    sin(radians($2)) *
    sin(radians(users.latitude)))
    ) AS distance FROM users) al WHERE user_id IN ($1:csv)`;
    if (req.body.search.order === 'algorithm') {
      ids = await calculatePonderation(req, ids, ll);
      ids = ids.map(e => e.user_id);
      const sqltest = `SELECT b.user_id,
        first_name,
        last_name,
        user_name,
        age,
        gender,
        orientation,
        bio,
        profile_pic,
        score,
        latitude,
    longitude,b.*,url FROM (SELECT *,
      distance FROM (SELECT *, (
        6371 *
        acos(cos(radians($2)) *
        cos(radians(users.latitude)) *
        cos(radians(users.longitude) -
        radians($3)) +
        sin(radians($2)) *
        sin(radians(users.latitude)))
        ) AS distance FROM users) AS al
      JOIN   unnest(ARRAY[$1:list]) WITH ORDINALITY t(user_id, ord) USING (user_id)
      ORDER  BY t.ord LIMIT 10) b JOIN images ON images.image_id = b.profile_pic ORDER BY ord`;
      const r = await db.any(sqltest, [ids, ll[0], ll[1]]);
      r.forEach(u => {
        u.ville = getCityFromLL(u.latitude, u.longitude);
      });
      return res.status(200).send(r);
    } else if (req.body.search.order && ids.length) {
      if (req.body.search.order === 'location') {
        sql += ' ORDER BY distance';
      } else if (req.body.search.order === 'fame') {
        sql += ' ORDER BY score DESC';
      } else if (req.body.search.order === 'age') {
        sql += ' ORDER BY age DESC';
      } else if (req.body.search.order === 'tags') {
        let mytagsId = await db.any(
          `SELECT user_tag_id FROM user_tags WHERE user_id=$1`,
          req.user.user_id
        );
        mytagsId = mytagsId.map(e => e.user_tag_id);
        ids = await db.any(
          `SELECT users.user_id,count(*) FROM user_tags INNER JOIN users ON users.user_id=user_tags.user_id
        WHERE user_tags.tag_id IN ($1:csv)  AND user_tags.user_id IN ($2:csv) group by users.user_id ORDER BY count`,
          [mytagsId, ids]
        );
        ids = ids.map(e => e.user_id);
      }
    }
    sql += ' LIMIT 10';
    if (ids.length) {
      const find = await db.any(sql, [ids, ll[0], ll[1]]);
      find.forEach(u => {
        u.ville = getCityFromLL(u.latitude, u.longitude);
      });
      return res.status(200).send(find);
    } else res.status(200).send([]);
  } catch (error) {
    res.sendStatus(500);
  }
});

const updateManyTags = async () => {
  await Promise.all([
    updateTags(5, ['chat']),
    updateTags(6, ['musique', 'chien']),
    updateTags(7, ['nature', 'randonné']),
    updateTags(8, ['chien', 'chat', 'tarantule']),
    updateTags(9, ['licorne', 'homo sapiens', 'filme']),
    updateTags(10, ['licorne', 'homo sapiens', 'filme']),
    updateTags(11, ['licorne', 'homo sapiens', 'filme', 'Calcutta']),
    updateTags(12, ['carambar', 'math', 'filme']),
    updateTags(13, ['caribou', 'livre', 'comédie', 'UNESCO']),
    updateTags(14, ['voyage', 'série TV', 'filme']),
  ]);
};

app.post('/registerMany', async (req, res) => {
  try {
    await registerUsers();
    await updateManyTags();
    return res.sendStatus(200);
  } catch (e) {
    return res.sendStatus(500);
  }
});

// const newRoom = (roomName, id1, id2) => {};

const chatName = (id1, id2) => {
  let chatName = '';
  if (id1 !== id2) {
    chatName += Math.min(id1, id2);
    chatName += '-';
    chatName += Math.max(id1, id2);
    return chatName;
  }
  throw new Error('no private room (id1 == id2)');
};

const matchDetector = async (myId, targetId) => {
  const like = await db.oneOrNone(
    'SELECT * FROM likes WHERE liker_id = $1 AND target_id = $2',
    [targetId, myId]
  );
  if (like) {
    const name = chatName(myId, targetId);
    const alreadyExist = await db.oneOrNone(
      'SELECT * FROM chats WHERE name=$1',
      [name]
    );
    if (!alreadyExist) {
      await db.any(
        'INSERT INTO chats (first_id, second_id, name) VALUES ( $1, $2, $3 ) ',
        [myId, targetId, chatName(myId, targetId)]
      );
      await sendNotification(myId, targetId, 'match');
      await sendNotification(targetId, myId, 'match');
      await recalculUserScore(myId);
      await recalculUserScore(targetId);
    }
  }
};

async function postNotification(sender, receiver, type) {
  const notification = await db.one(
    'INSERT INTO notifications ( "user_id_send", "user_id_receiver", "type" ) VALUES ($1, $2, $3) RETURNING notification_id',
    [sender, receiver, type]
  );
  const joinUserInfo = await db.any(
    'SELECT notifications.*, users.user_name, users.created_on FROM notifications JOIN users ON users.user_id=notifications.user_id_send WHERE notification_id=$1',
    [notification.notification_id]
  );
  return joinUserInfo;
}

app.post('/read-notifications', authenticateToken, async (req, res) => {
  try {
    await db.none(
      `UPDATE notifications SET watched=$1 WHERE user_id_receiver=$2`,
      [true, req.user.user_id]
    );
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ msg: e });
  }
});

app.post('/read-notification', authenticateToken, async (req, res) => {
  try {
    await db.none(
      `UPDATE notifications SET watched=$1 WHERE notification_id=$2 AND user_id_receiver=$3`,
      [true, req.body.id, req.user.user_id]
    );
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ msg: e });
  }
});

app.get('/get-notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await db.manyOrNone(
      `SELECT notifications.*, users.user_name, users.created_on FROM notifications JOIN users ON users.user_id=notifications.user_id_send WHERE user_id_receiver=$1 AND watched=false`,
      [req.user.user_id]
    );
    return res.status(200).send(notifications);
  } catch (e) {
    return res.status(500).json({ msg: e });
  }
});

async function recalculUserScore(myId) {
  try {
    const positiveCount = await db.oneOrNone(
      `SELECT COUNT(*) FROM notifications WHERE user_id_receiver=$1 AND (type='view' OR type='match')`,
      [myId]
    );
    const likesCount = await db.oneOrNone(
      `SELECT COUNT(*) FROM likes WHERE target_id=$1`,
      [myId]
    );
    const newScore = Number(positiveCount.count) + Number(likesCount.count);
    await db.none(`UPDATE users SET score=$1 WHERE user_id=$2`, [
      newScore,
      myId,
    ]);
  } catch {}
}

app.post('/like', authenticateToken, async (req, res) => {
  try {
    const targetIdInt = Number(req.body.targetId);
    const user = await getUserInfos(req.user.user_id);
    if (user.user_id === targetIdInt)
      return res.status(200).json({ msg: 'You cannot like yourself' });

    const like = await db.any(
      'SELECT * FROM likes WHERE liker_id = $1 AND target_id = $2',
      [user.user_id, targetIdInt]
    );
    if (like.length !== 0)
      return res.status(200).json({ msg: 'User already liked' });

    const sql = `INSERT INTO likes ( liker_id, target_id ) VALUES ( $1, $2 )`;
    await db.any(sql, [user.user_id, targetIdInt]);
    await sendNotification(req.user.user_id, targetIdInt, 'like');
    await recalculUserScore(targetIdInt);
    matchDetector(user.user_id, targetIdInt);
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ msg: e });
  }
});

app.post('/unlike', authenticateToken, async (req, res) => {
  try {
    const targetId = req.body.targetId;
    const user = await getUserInfos(req.user.user_id);
    if (user.user_id === targetId)
      return res.status(403).json({ msg: 'You cannot unlike yourself' });
    await db.any(`DELETE FROM likes WHERE liker_id=$1 AND target_id=$2`, [
      user.user_id,
      targetId,
    ]);
    await sendNotification(req.user.user_id, targetId, 'unlike');
    await recalculUserScore(targetId);
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ msg: e });
  }
});

app.post('/view', authenticateToken, async (req, res) => {
  try {
    const user = await getUserInfos(req.user.user_id);
    const targetId = req.body.targetId;

    // Check if not viewing yourself
    if (user.user_id === targetId)
      return res.status(200).json({ msg: 'You cannot view yourself' });

    // Get already viewed users
    const data = await db.any(
      'SELECT * FROM views WHERE viewer_id = $1 AND target_id = $2',
      [user.user_id, targetId]
    );
    // View if not already did
    if (data.length === 0) {
      await db.any(
        `INSERT INTO views ( viewer_id, target_id ) VALUES ( $1, $2 )`,
        [user.user_id, targetId]
      );
    }

    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ msg: e });
  }
});

app.post('/devil', authenticateToken, async (req, res) => {
  // TODO check if pass by devil picture ??
  try {
    const user = await getUserInfos(req.user.user_id);
    const myIdInt = Number(user.user_id);
    if (user.privilege)
      return res.status(200).json({ msg: 'You have already Devil privileges' });
    await db.none('UPDATE users SET privilege=$1 WHERE user_id=$2', [
      true,
      myIdInt,
    ]);
    return res.status(200).json({ msg: 'You now have Devil privilege' });
  } catch (e) {
    return res.status(500).json({ msg: e });
  }
});

app.post('/devil-match', authenticateToken, async (req, res) => {
  try {
    const user = await getUserInfos(req.user.user_id);
    const myIdInt = Number(user.user_id);
    const targetIdInt = Number(req.body.targetId);
    if (user.privilege === false)
      return res.status(403).json({ msg: "You haven't the Devil privilege" });
    if (myIdInt === targetIdInt)
      return res.status(200).json({ msg: 'You cannot match yourself' });
    if ((await userIsBlocked(targetIdInt, myIdInt)) === true)
      return res.status(403).json({ msg: 'This user has blocked you' });
    if ((await userIsBlocked(myIdInt, targetIdInt)) === true)
      return res.status(403).json({ msg: 'You have blocked this user' });
    // FUNCTION MAYBE ? ( -> /like )
    const likedByMe = await db.oneOrNone(
      'SELECT * FROM likes WHERE liker_id = $1 AND target_id = $2',
      [myIdInt, targetIdInt]
    );
    if (!likedByMe) {
      await db.none(
        `INSERT INTO likes ( liker_id, target_id ) VALUES ( $1, $2 )`,
        [myIdInt, targetIdInt]
      );
      await sendNotification(myIdInt, targetIdInt, 'like');
      await recalculUserScore(targetIdInt);
    }
    //
    const likedByTarget = await db.oneOrNone(
      'SELECT * FROM likes WHERE liker_id = $1 AND target_id = $2',
      [targetIdInt, myIdInt]
    );
    if (!likedByTarget) {
      await db.none(
        `INSERT INTO likes ( liker_id, target_id ) VALUES ( $1, $2 )`,
        [targetIdInt, myIdInt]
      );
      await sendNotification(targetIdInt, myIdInt, 'like');
      await recalculUserScore(myIdInt);
    }
    //
    const name = chatName(myIdInt, targetIdInt);
    const alreadyExist = await db.oneOrNone(
      'SELECT * FROM chats WHERE name=$1',
      [name]
    );
    if (!alreadyExist) {
      await db.any(
        'INSERT INTO chats (first_id, second_id, name) VALUES ( $1, $2, $3 )',
        [myIdInt, targetIdInt, chatName(myIdInt, targetIdInt)]
      );
      await sendNotification(myIdInt, targetIdInt, 'match');
      await sendNotification(targetIdInt, myIdInt, 'match');
      return res.status(200).json({ msg: 'Successfully Devil Matched' });
    }
    return res.status(200).json({ msg: 'You have already Devil Matched' });
  } catch (e) {
    return res.status(500).json({ msg: e });
  }
});

async function findPartnerFor(user, ip) {
  // filter by gender and tags
  // order by distance then by fame
  // exclude block view like
  const data = [user.user_id];
  const ll = getLL(user, ip);
  data.push(ll[0]);
  data.push(ll[1]);
  let sql = `SELECT *,
  (
    6371 *
    acos(cos(radians($2)) *
    cos(radians(u.latitude)) *
    cos(radians(u.longitude) -
    radians($3)) +
    sin(radians($2)) *
    sin(radians(u.latitude )))
    ) AS distance
  FROM users u
  WHERE u.user_id != $1
  AND NOT EXISTS (SELECT * FROM views v WHERE v.viewer_id = $1 AND v.target_id = u.user_id)
  AND NOT EXISTS (SELECT * FROM likes l WHERE l.liker_id = $1  AND l.target_id = u.user_id)`;
  if (user.orientation !== 2) {
    sql += ` AND gender = $4`;
    data.push(user.orientation);
  }
  sql += ` ORDER BY distance LIMIT 10`;
  const res = await db.any(sql, data);
  res.forEach(reco => {
    reco.ville = getCityFromLL(reco.latitude, reco.longitude);
    delete reco.password;
  });
  return res;
}

function getLL(user, ip) {
  if (user.latitude && user.longitude) {
    return [user.latitude, user.longitude];
  } else {
    const pos = getPosById(ip);
    if (pos) {
      return [pos[0], pos[1]];
    } else {
      return [48.856614, 2.3522219]; // paris
    }
  }
}

app.post('/getRecommandation', authenticateToken, async (req, res) => {
  try {
    // console.log(req.body.ip);
    // console.log(pos);
    const user = await getUserInfos(req.user.user_id);
    const partner = await findPartnerFor(user, req.body.ip);

    return res.status(200).json(partner);
  } catch (e) {
    return res.sendStatus(500).json({ msg: e });
  }
});

function getPosById(ip) {
  return lookup(ip)?.ll;
}

app.post('/proposeDate', authenticateToken, async (req, res) => {
  if (
    !req.body.room &&
    !req.body.date &&
    !req.body.hour &&
    !req.body.location
  ) {
    res.sendStatus(400);
  }
  try {
    console.log(req.body);
    // eslint-disable-next-line no-unused-vars
    const [senderId, receiverId] = attributionRoomMessage(req, req.body.room);
    if ((await userIsBlocked(receiverId, senderId)) === true)
      return res.sendStatus(200);
    if ((await userIsBlocked(senderId, receiverId)) === true)
      return res.sendStatus(200);
    const date = new Date();
    date.setMinutes(date.getMinutes() + 2);
    const text =
      'vous avez une date le ' +
      date +
      " à l'endroit nommée : " +
      req.body.location;
    if (await isIdInRoom(req.user.user_id, req.body.room)) {
      const sql = `INSERT into messages  ( "sender_id", "chat_id", "message", "type", "created_on") VALUES ($1, $2, $3, 2, NOW()) RETURNING *`;
      const msgId = await db.one(sql, [req.user.user_id, req.body.room, text]);
      msgId.user_name = (await getUserInfos(req.user.user_id)).user_name;
      await db.none(
        `INSERT INTO mail_dates (sender_id,receiver_id,text,send_date,msg_id) VALUES ( $1, $2, $3, $4, $5 )`,
        [req.user.user_id, 2, text, date, msgId.msg_id]
      );
      await sendNotification(senderId, receiverId, 'invit');
      sendMessage(req.user.user_id, receiverId, msgId);
    } else {
      res.sendStatus(403);
    }
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

async function updateDate(receiverId, msg, resp, newMsg) {
  const date = await db.one(
    `SELECT * FROM mail_dates WHERE sender_id=$1 AND msg_id=$2`,
    [receiverId, msg.msg_id]
  );
  const verifMsg = await db.one(
    `SELECT * FROM messages WHERE msg_id=$1 AND chat_id=$2`,
    [msg.msg_id, msg.chat_id]
  );
  if (date && verifMsg) {
    await db.any(`UPDATE mail_dates SET accept=$1 WHERE mail_date_id=$2`, [
      resp,
      date.mail_date_id,
    ]);
    await db.any(`UPDATE messages SET type=1,message=$1 WHERE msg_id=$2`, [
      newMsg,
      msg.msg_id,
    ]);
    return date;
  }
}

async function getEmailid(id) {
  const email = await db.one('SELECT email FROM users WHERE user_id=$1', [id]);
  return email.email;
}

function sendDateEmail(email, date) {
  const mailOptions = {
    from: 'Matcha <camagru.tmarcon@gmail.com>',
    to: email,
    subject: 'Date',
    html: '<p>' + date.text + '</p>',
  };
  transporter.sendMail(mailOptions);
}

app.post('/acceptDate', authenticateToken, async (req, res) => {
  if (!req.body.message && !req.body.resp && !req.body.message.chat_id) {
    res.sendStatus(400);
  }
  try {
    // eslint-disable-next-line no-unused-vars
    const [senderId, receiverId] = attributionRoomMessage(
      req,
      req.body.message.chat_id
    );
    if ((await userIsBlocked(receiverId, senderId)) === true)
      return res.sendStatus(200);
    if ((await userIsBlocked(senderId, receiverId)) === true)
      return res.sendStatus(200);
    let text = '';
    if (await isIdInRoom(req.user.user_id, req.body.message.chat_id)) {
      if (req.body.resp) {
        text =
          req.user.user_name +
          ' à accepter la proposition de date. Vous recevrez un email juste avant le date';
        const date = await updateDate(
          receiverId,
          req.body.message,
          req.body.resp,
          text
        );
        // https://github.com/node-schedule/node-schedule
        const schedule = require('node-schedule');
        const time = new Date();
        time.setMinutes(time.getMinutes() + 1);
        const email1 = await getEmailid(senderId);
        const email2 = await getEmailid(receiverId);
        schedule.scheduleJob(
          time,
          function (email1, email2, date) {
            sendDateEmail(email1, date);
            sendDateEmail(email2, date);
          }.bind(null, email1, email2, date)
        );
      } else {
        text = req.user.user_name + ' à refuser la proposition de date.';
        await updateDate(receiverId, req.body.message, req.body.resp, text);
      }
      const data = {
        sender_id: (await getUserInfos(req.user.user_id)).user_id,
        user_name: (await getUserInfos(req.user.user_id)).user_name,
        chat_id: req.body.message.chat_id,
        type: 3,
        message: text,
      };
      await sendNotification(senderId, receiverId, 'date');
      sendMessage(req.user.user_id, receiverId, data);
      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    res.sendStatus(500);
  }
});
export default {
  path: '/api',
  handler: app,
};

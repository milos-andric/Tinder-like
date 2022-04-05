// File managment
import * as path from 'path';
import * as fs from 'fs';
import fileUpload from 'express-fileupload';

// Credentials
import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';
import * as bcrypt from 'bcrypt';

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

const users = [];
const http = require('http');
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
    // console.log('emit', element, notif[0].type, notif[0].user_id_send, " > ", notif[0].uer_id_receiver);
    io.to(element).emit('receiveNotification', notif);
  });
}

function getSocketById(userId) {
  const socketList = users
    .filter(e => e.user_id === userId)
    .map(e => e.socket_id);
  return socketList;
}

function isConnected(userId) {
  console.log(users, userId);
  if (users.find(e => e.user_id === userId)) return true;
  return false;
}

async function sendNotification(myId, targetId, typeNotif) {
  const alreadyNotified = await db.oneOrNone(
    'SELECT * FROM notifications WHERE type=$1 AND user_id_send=$2 AND user_id_receiver=$3',
    [typeNotif, myId, targetId]
  );
  if (!alreadyNotified) {
    const targetIdInt = Number(targetId);
    const socketList = getSocketById(targetIdInt);
    if (targetIdInt !== myId) {
      const elem = await postNotification(myId, targetIdInt, typeNotif);
      emitNotifications(socketList, elem);
    }
  }
}

io.on('connection', socket => {
  console.log(`${socket.id} is connected to / by io !`);
  // console.log(socket.handshake.auth.token); // parfois undefined TODO
  if (socket.handshake.auth.token) {
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
    users.splice(
      users.findIndex(obj => obj.socket_id === socket.id),
      1
    );
    io.emit(
      'online',
      users.map(e => e.user_id)
    );
    console.log(`${socket.id} is disconnected to / by io !`);
    socket.disconnect(true);
  });
});
server.listen(3001);

// Functions

const generateAccessToken = user => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1y' });
};

const getUserInfos = async id => {
  try {
    const data = await global.db.one(
      'SELECT * FROM users WHERE user_id = $1',
      id
    );
    delete data.password;

    if (data.profile_pic)
      data.profile_pic = await global.db.oneOrNone(
        'SELECT * FROM images WHERE image_id = $1',
        data.profile_pic
      );
    return data;
  } catch (e) {
    throw new Error('User is not found');
  }
};

const getUserImages = async id => {
  try {
    return await global.db.any('SELECT * FROM images WHERE user_id = $1', id);
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
    .then(data => {
      if (data.activation_code === 'activated') {
        bcrypt.compare(req.body.password, data.password, (_err, result) => {
          if (result === true)
            res.send({ msg: 'Success', token: generateAccessToken(data) });
          else res.status(403).send({ msg: 'Invalid password' });
        });
      } else res.status(403).send({ msg: "Account isn't activated" });
    })
    .catch(_error => {
      res.status(403).send({ msg: 'User is not found' });
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
  validateUsername(
    'user_name',
    'Username must be at between 3 and 16 chars long'
  ),
  validateEmail('email'),
  validateAge('birth_date', 'You must be older than 18 yo'),
  validateInt('gender', 0, 1),
  validateInt('orientation', 0, 2),
  validateText('bio', 255, 'Bio must be shorter than 255 chars long'),
  (req, res) => {
    const sql = `UPDATE users SET
            ( first_name, last_name, user_name, email, age, gender, orientation, bio, tags )
            = ( $1, $2, $3, $4, $5, $6, $7, $8, $9 ) WHERE user_id=$10`;

    db.none(sql, [
      req.body.first_name,
      req.body.last_name,
      req.body.user_name,
      req.body.email,
      req.body.birth_date,
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
          } else res.status(403).json({ msg: 'Invalid current password' });
        });
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
    res.status(200).json({ msg: 'Success' });
  } catch (e) {
    res.status(400).json({ msg: 'Image not found' });
  }
});

app.post('/profile-image', authenticateToken, async (req, res) => {
  try {
    await db.none(`UPDATE users SET profile_pic=$1 WHERE user_id=$2`, [
      req.body.image ? req.body.image.image_id : null,
      req.user.user_id,
    ]);
    res.status(200).json({ msg: 'Success' });
  } catch (e) {
    res.status(400).json({ msg: 'Failure' });
  }
});

app.post('/logout', (_req, res) => {
  res.status(200).json({ msg: 'Successfully logged out' });
});

// User actions

app.post('/user-block', authenticateToken, async (req, res) => {
  const sender = req.user.user_id;
  const receiver = req.body.receiver;

  if (sender === receiver)
    return res.status(400).json({ msg: 'You cannot block yourself' });

  try {
    const data = await db.any(
      'SELECT * FROM blocks WHERE sender_id = $1 AND blocked_id = $2',
      [sender, receiver]
    );
    if (data.length !== 0)
      return res.status(400).json({ msg: 'User already blocked' });
    await db.none(
      'INSERT INTO blocks ( sender_id, blocked_id ) VALUES ( $1, $2 )',
      [sender, receiver]
    );
    res.status(200).json({ msg: 'Successfully blocked user' });
  } catch (e) {
    res.status(400).json({ msg: "Couldn't block user" });
  }
});

app.post('/user-report', authenticateToken, async (req, res) => {
  const sender = req.user.user_id;
  const receiver = req.body.receiver;

  if (sender === receiver)
    return res.status(400).json({ msg: 'You cannot report yourself' });

  try {
    const data = await db.any(
      'SELECT * FROM reports WHERE sender_id = $1 AND reported_id = $2',
      [sender, receiver]
    );
    if (data.length !== 0)
      return res.status(400).json({ msg: 'User already reported' });
    await db.none(
      'INSERT INTO reports ( sender_id, reported_id ) VALUES ( $1, $2 )',
      [sender, receiver]
    );
    res.status(200).json({ msg: 'Successfully reported user' });
  } catch (e) {
    res.status(400).json({ msg: "Couldn't report user" });
  }
});

// GET routes

app.get('/me', authenticateToken, async (req, res) => {
  const id = req.user.user_id;
  try {
    const user = await getUserInfos(id);
    res.status(200).json(user);
  } catch (e) {
    res.status(404).json({ msg: e });
  }
});

app.get('/user/:user_id', authenticateToken, async (req, res) => {
  const myId = req.user.user_id;
  let targetId;
  if (req.params && req.params.user_id) targetId = req.params.user_id;
  try {
    const user = await getUserInfos(targetId);
    sendNotification(myId, targetId, 'view');
    res.status(200).json(user);
  } catch (e) {
    res.status(404).json({ msg: e });
  }
});

app.get('/isliked/:target_id', authenticateToken, async (req, res) => {
  const myId = req.user.user_id;
  const targetId = req.params.target_id;
  try {
    const liked = await db.manyOrNone(
      'SELECT * FROM likes WHERE liker_id=$1 AND target_id=$2',
      [myId, targetId]
    );
    if (liked && liked.length) return res.status(200).json(true);
    else return res.status(200).json(false);
  } catch (e) {
    return res.status(404).json({ msg: e });
  }
});

app.get('/user-images/:user_id?', authenticateToken, async (req, res) => {
  let id = req.user.user_id;
  if (req.params && req.params.user_id) id = req.params.user_id;

  try {
    const images = await getUserImages(id);
    res.status(200).json(images);
  } catch (e) {
    res.status(404).json({ msg: e });
  }
});

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
  if (await isIdInRoom(req.user.user_id, req.body.room)) {
    const sql = 'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_on';
    const messages = await db.manyOrNone(sql, [req.body.room]);
    for (let i = 0; i < messages.length; i++) {
      messages[i].sender_id = await idToUsername(messages[i].sender_id);
    }
    res.send(messages);
  } else {
    res.sendStatus(403);
  }
});

const sendMessage = (id, data) => {
  io.to(getSocketById(id)).emit('receiveChatMessage', data);
};
app.post('/sendRoomMessages', authenticateToken, async (req, res) => {
  const names = req.body.room.split('-');
  const receiverId = names[0] === req.user.user_id ? names[0] : names[1];
  if (
    (await isIdInRoom(req.user.user_id, req.body.room)) &&
    req.body.message.length > 0
  ) {
    const sql = `INSERT into messages  ( "sender_id", "chat_id", "message", "created_on") VALUES ($1, $2, $3, NOW())`;
    await db.any(sql, [req.user.user_id, req.body.room, req.body.message]);
    const data = {
      sender_id: (await getUserInfos(req.user.user_id)).user_name,
      chat_id: req.body.room,
      message: req.body.message,
    };
    sendMessage(receiverId, data);
    res.send(data);
  } else {
    res.sendStatus(403);
  }
});

app.get('/getAvailableRooms', authenticateToken, async (req, res) => {
  const sql = 'SELECT * FROM chats WHERE first_id = $1 OR second_id = $1';
  const rooms = await db.manyOrNone(sql, [req.user.user_id]);
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].first_id === req.user.user_id) {
      rooms[i].pal_name = await idToUsername(rooms[i].second_id);
    } else rooms[i].pal_name = await idToUsername(rooms[i].first_id);
  }
  res.send(rooms);
});

app.post('/getUserLikeHistory', authenticateToken, async (req, res) => {
  console.log(req.body.userId);
  const sql =
    'SELECT * FROM likes WHERE liker_id = $1 OR target_id = $1 ORDER BY created_on';
  const entries = await db.manyOrNone(sql, [req.body.userId]);
  const myName = await idToUsername(req.body.userId);
  const data = [];
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].liker_id === req.body.userId) {
      const tmp = await idToUsername(entries[i].target_id);
      data.push(`${myName} liked ${tmp}`);
    } else {
      const tmp = await idToUsername(entries[i].liker_id);
      data.push(`${myName} got a like from ${tmp}`);
    }
  }
  res.send(data);
});

app.post('/getUserViewHistory', authenticateToken, async (req, res) => {
  console.log(req.body.userId);
  const sql =
    'SELECT * FROM views WHERE viewer_id = $1 OR target_id = $1 ORDER BY created_on';
  const entries = await db.manyOrNone(sql, [req.body.userId]);
  const myName = await idToUsername(req.body.userId);
  const data = [];
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].viewer_id === req.body.userId) {
      const tmp = await idToUsername(entries[i].target_id);
      data.push(`${myName} viewed ${tmp}'s profile`);
    } else {
      const tmp = await idToUsername(entries[i].viewer_id);
      data.push(`${myName} got a view from ${tmp}`);
    }
  }
  res.send(data);
});

app.post('/getUserMatchHistory', authenticateToken, async (req, res) => {
  console.log(req.body.userId);
  const sql =
    'SELECT * FROM chats WHERE first_id = $1 OR second_id = $1 ORDER BY created_on';
  const entries = await db.manyOrNone(sql, [req.body.userId]);
  const myName = await idToUsername(req.body.userId);
  const data = [];
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].first_id === req.body.userId) {
      const tmp = await idToUsername(entries[i].second_id);
      data.push(`${myName} got a match with ${tmp}`);
    } else {
      const tmp = await idToUsername(entries[i].first_id);
      data.push(`${myName} got a match with ${tmp}`);
    }
  }
  res.send(data);
});

app.get('/is-online/:target_id', authenticateToken, (req, res) => {
  const id = Number(req.params.target_id);
  return res.status(200).json(isConnected(id));
});

app.post('/search', authenticateToken, (req, res) => {
  // console.log(req.body);
  // sanitize all inputs.
  // verify no additional data
  // verify data type value
  // search db
  if (!req.body.search) return res.status(404).json({ msg: 'No data found' });
  let sql = 'SELECT * FROM users';
  const values = [];
  if (Object.keys(req.body.search).length > 0) {
    let counter = 0;
    sql += ' WHERE';
    if (req.body.search.last_name) {
      counter++;
      if (counter > 1) {
        sql += ' AND';
      }
      sql += ' last_name LIKE $' + counter + '';
      const lastName = '%' + req.body.search.last_name + '%';
      values.push(lastName);
    }
    if (req.body.search.first_name) {
      counter++;
      if (counter > 1) {
        sql += ' AND';
      }
      sql += ' first_name LIKE $' + counter + '';
      const firstName = '%' + req.body.search.first_name + '%';
      values.push(firstName);
    }
    if (req.body.search.age) {
      counter++;
      if (counter > 1) {
        sql += ' AND';
      }
      sql += ' age BETWEEN' + ' $' + counter;
      counter++;
      sql += ' AND' + ' $' + counter;
      values.push(req.body.search.age[0]);
      values.push(req.body.search.age[1]);
    }
    // if (req.body.search.location) {
    //   counter++;
    //   if (counter > 1) {
    //     sql += ' AND';
    //   }
    //   sql += '  =' + ' $' + counter;
    // }
    if (req.body.search.fame) {
      counter++;
      if (counter > 1) {
        sql += ' AND';
      }
      sql += ' score >=' + ' $' + counter;
      values.push(req.body.search.fame);
    }
    db.any(sql, values).then(data => {
      res.status(200).send(data);
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
        'orientation',
      ],
      'users'
    );
    return ret;
  });
  db.any(sql).then(function (data) {
    res.sendStatus(200);
  });
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
    await db.any(
      'INSERT INTO chats (first_id, second_id, name) VALUES ( $1, $2, $3 ) ',
      [myId, targetId, chatName(myId, targetId)]
    );
    sendNotification(myId, targetId, 'match');
    sendNotification(targetId, myId, 'match');
    return true;
  }
  return false;
};

async function postNotification(sender, receiver, type) {
  try {
    const data = await db.one(
      'INSERT INTO notifications ( "user_id_send", "user_id_receiver", "type" ) VALUES ($1, $2, $3) RETURNING *',
      [sender, receiver, type]
    );
    const join = await db.any(
      'SELECT notifications.*, users.user_name FROM notifications JOIN users ON users.user_id=notifications.user_id_send WHERE notification_id=$1',
      data.notification_id
    );
    return join;
  } catch (error) {
    console.log(error);
  }
}

app.post('/read-notifications', authenticateToken, (req, res) => {
  db.any(`UPDATE notifications SET watched=$1 WHERE user_id_receiver=$2`, [
    true,
    req.user.user_id,
  ])
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (_error) {
      res.status(403).send({ msg: 'User is not found' });
    });
});

app.post('/read-notification', authenticateToken, (req, res) => {
  db.any(
    `UPDATE notifications SET watched=$1 WHERE notification_id=$2 AND user_id_receiver=$3`,
    [true, req.body.id, req.user.user_id]
  )
    .then(function (data) {
      res.sendStatus(200);
    })
    .catch(function (error) {
      res.status(403).send(error);
    });
});

app.get('/get-notifications', authenticateToken, (req, res) => {
  db.any(
    `SELECT notifications.*, users.user_name FROM notifications JOIN users ON users.user_id=notifications.user_id_send WHERE user_id_receiver=$1 AND watched=false`,
    req.user.user_id
  )
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (_error) {
      res.status(403).send({ msg: 'User is not found' });
    });
});

app.post('/like', authenticateToken, async (req, res) => {
  const targetId = req.body.targetId;
  const user = await getUserInfos(req.user.user_id);
  if (user.user_id === targetId)
    return res.status(400).json({ msg: 'You cannot like yourself' });

  const like = await db.any(
    'SELECT * FROM likes WHERE liker_id = $1 AND target_id = $2',
    [user.user_id, targetId]
  );
  if (like.length !== 0)
    return res.status(200).json({ msg: 'User already liked' });

  const sql = `INSERT INTO likes ( liker_id, target_id ) VALUES ( $1, $2 )`;
  await db.any(sql, [user.user_id, targetId]).catch(err => {
    res.status(500).json(err);
  });
  sendNotification(req.user.user_id, targetId, 'like');
  matchDetector(user.user_id, targetId);
  res.sendStatus(200);
});

app.post('/unlike', authenticateToken, async (req, res) => {
  const targetId = req.body.targetId;
  const user = await getUserInfos(req.user.user_id);
  // console.log(typeof(targetId), targetId);
  if (user.user_id === targetId)
    return res.status(400).json({ msg: 'You cannot unlike yourself' });

  // const data = await db.oneOrNone(
  //   'SELECT * FROM likes WHERE liker_id = $1 AND target_id = $2',
  //   [user.user_id, targetId]
  // );
  // if (!data)
  //   return res.status(200).json({ msg: 'User must be liked first' });
  await db
    .any(`DELETE FROM likes WHERE liker_id=$1 AND target_id=$2`, [
      user.user_id,
      targetId,
    ])
    .catch(err => {
      return res.status(500).json(err);
    });
  sendNotification(req.user.user_id, targetId, 'unlike');
  return res.sendStatus(200);
});

app.post('/view', authenticateToken, async (req, res) => {
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
  } else console.log('ALREADY SEEN');

  res.sendStatus(200);
});

const findPartnerFor = async user => {
  let sql = `SELECT * FROM users u 
  WHERE u.user_id != $1
  AND NOT EXISTS (SELECT * FROM views v WHERE v.viewer_id = $1 AND v.target_id = u.user_id)
  AND NOT EXISTS (SELECT * FROM likes l WHERE l.liker_id = $1  AND l.target_id = u.user_id)`;
  if (user.orientation !== 2) sql += ` AND gender = $2`;
  sql += ` ORDER BY score DESC LIMIT 10`;

  const data =
    user.orientation !== 2 ? [user.user_id, user.orientation] : user.user_id;
  const res = await db.any(sql, data);

  res.forEach(reco => delete reco.password);
  return res;
};

app.post('/getRecommandation', authenticateToken, async (req, res) => {
  const user = await getUserInfos(req.user.user_id);
  const partner = await findPartnerFor(user);

  res.status(200).json(partner);
});

export default {
  path: '/api',
  handler: app,
};

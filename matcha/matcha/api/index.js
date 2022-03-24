import { Console } from "console";

const { createServer } = require("http");
const express = require('express');
const app = express();

// require('../api/notification.js');
// require('../api/socket.js');

const httpServer = createServer(app);

// SOCKET
const { Server } = require("socket.io");
const users = [];

const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});
httpServer.listen(3001);

function socketIdentification(socket) {
  const token = socket.handshake.auth.token.split(' ')[1];
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log(`${socket.id} is disconnected because bad token !`)
      socket.disconnect(true);
    }
    return user;
  });
}

function emitToUserId(userId){
  for (let i = 0; i < users.length; i++) {
    if (users[i].user_id === userId) {
      console.log(`notif sent ${users[i].socket_id}`);
      io.to(users[i].socket_id).emit('receiveNotification', 'You have receive a notif !');
    }
  }
}

// NAMESPACES
const general = io.of('/');
const chat = io.of('/chat');

// use() middleware
// https://socket.io/docs/v4/middlewares/
// general.use((socket, next) => {
// })
general.on('connection', (socket) => {
  console.log(`${socket.id} is connected to /general namespace !`)
  if (socket.handshake.auth.token) {
    const user = socketIdentification(socket);
    users.push({
      user_id: user.user_id,
      socket_id: socket.id,
    })
  } else {
    socket.disconnect(true);
  }

  // for (let i = 0; i < users.length; i++)
  //   console.log(users[i]);
  
  socket.on('notification', (data) => {
    emitToUserId(data.receiverId);
  });
  socket.on("disconnect", (_reason) => {
    // for (let i = 0; i < users.length; i++)
      // console.log("IN: ", i, users[i]);

    users.splice(users.findIndex(obj => obj.socket_id === socket.id), 1)

    // for (let i = 0; i < users.length; i++)
      // console.log("OUT: ", i, users[i]);
  });
})

chat.on('connection', (socket) => {
  console.log(`${socket.id} is connected to /chat namespace !`)
})

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

app.post('/logout', (req, res) => {
  res.send({ msg: 'Successfully logged out' });
});

app.get('/user', authenticateToken, (req, res) => {
  console.log(req.user);
});

// app.post('/visit', authenticateToken, (req, res) => {
//   db.none(`INSERT INTO notifications ( user_id_send, user_id_receiver, content, type, watched)
//   VALUES ( $1, $2, $3, $4, $5 )`, [req.user.user_id, 2, 'You have a visit', 'visit', false])
//     .then(function (data) {
//       req.user.
//         res.sendStatus(200);;
//     })
//     .catch(function (_error) {
//         res.sendStatus(500);
//     });
// });

app.get('/notifications', authenticateToken, (req, res) => {
  db.any(`SELECT * FROM notifications WHERE user_id_receiver = $1`, req.user.user_id)
  .then(function (data) {
    if (data?.length > 0)
      res.status(200).json(data);
    else {
      res.status(200).json([{ notification_id: 0, content: "You have 0 notification."}]);
    }
  })
  .catch(function (_error) {
    res.status(403).send({ msg: 'User is not found' });
  });
});

export default {
  path: '/api',
  handler: app,
};

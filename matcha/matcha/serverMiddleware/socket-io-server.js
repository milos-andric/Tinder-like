// // This file is executed once when the server is started
// console.log('Setting up socket.io server ...');

// // Setup a socket.io server on port 3001 that has CORS disabled (do not set this to port 3000 as port 3000 is where the nuxt dev server serves your nuxt application)
// const io = require('socket.io')(3001, {
//   cors: {
//     // No CORS at all
//   },
// });

// var i = 0;
// // Broadcast "tick" event every second
// // Or do whatever you want with io ;)
// setInterval(() => {
//   i++;
//   console.log('tick');
//   io.emit('tick', i);
// }, 1000);

// console.log(
//   "socket.io server now sends 'tick' event with 'tickId' parameter every second ..."
// );

// // Since we are a serverMiddleware, we have to return a handler, even if this it does nothing
// export default function (req, res, next) {
//   next();
// }

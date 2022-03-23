const pgp = require('pg-promise')(/* options */);
const db = pgp('postgres://postgres:changeme@postgres:5432/matcha_db');
module.exports = db;
// export default pgp;

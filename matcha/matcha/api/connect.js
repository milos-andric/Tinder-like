import pgPromise from 'pg-promise';

const pgp = pgPromise();
export const db = pgp('postgres://postgres:changeme@postgres:5432/matcha_db')
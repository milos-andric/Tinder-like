import factory from 'factory-girl';
import User from '../model/User.js';

function buildFactory() {
  try {
    factory.define('User', User, {
      gender: factory.chance('integer', { min: 0, max: 1 }),
      first_name: factory.chance('first', { nationality: 'fr' }),
      last_name: factory.chance('last', { nationality: 'fr' }),
      user_name: factory.seq('User.email', n => `${n}`),
      password: factory.chance('last', { nationality: 'fr' }),
      age: factory.chance('age', { type: 'adult' }),
      score: factory.chance('integer', { min: 0, max: 100 }),
      email: factory.seq('User.email', n => `user${n}@ymail.com`),
      bio: factory.chance('paragraph', { sentences: 1 }),
    });
    return factory;
  } catch {
    return factory;
  }
}

export default buildFactory;

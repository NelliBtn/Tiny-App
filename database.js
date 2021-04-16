const bcrypt = require('bcrypt');

const urlDatabase = {
  "example1": {longURL: "http://www.lighthouselabs.ca", userId: 'userIdExample1'},
  "example2": {longURL: "http://www.google.com", userId: 'userIdExample2'},
  "shortDino": {longURL: "http://dino.com", userId: "dino"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  'dino': {
    id: 'dino',
    email: 't@rex.com',
    password: bcrypt.hashSync('dino', 10)
  }
};

module.exports = { urlDatabase, users }
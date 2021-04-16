const bcrypt = require('bcrypt');

const getUserByEmail = function (email, users) {
  for (let user in users) {
    if (users[user]['email'] === email) {
      return users[user];
    }
  } return false;
};

const urlsForUser = (urlDatabase, id) => {
  let urlsToShow = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === id) {
      urlsToShow[url] = urlDatabase[url];
    }
  } return urlsToShow;
};

const generateRandomString = (length) => {
  return Math.random().toString(36).substr(2, length)
};

const userOwnsURL = (shortURL, urlDatabase, userId) => {
  if (urlDatabase[shortURL].userId === userId) {
    return true;
  } 
  return false;
};

//AUTHENTIFICATION FOR LOGIN
const authentification = (email, password, users, user) => {
  if (user && bcrypt.compareSync(password, user.password)) { // compare input password vs object password
    return { data: user, error: null };
  };
  
  if (!email || !password) {
    const statusCode = 400;
    return { data: null, error: `${statusCode}: There is an empty field`};
  } else if (!getUserByEmail(email, users)) {
    const statusCode = 403;
    return { data: null, error: `${statusCode}: This email is not found`};
  } else if (getUserByEmail(email, users).password !== password) {
    const statusCode = 403;
    return { data: null, error: `${statusCode}: Wrong password`};
  };
};






module.exports = { getUserByEmail, urlsForUser, generateRandomString, userOwnsURL, authentification };
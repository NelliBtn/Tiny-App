const express = require("express");
const app = express(); // creates a server
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail, urlsForUser, generateRandomString, userOwnsURL, authentification } = require('./helpers');
const { urlDatabase, users } = require('./database')

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs"); // tells the Express app to use EJS as its templating engine
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);

// ROOT URL
app.get("/", (req, res) => {
  req.session.user_id ? res.redirect('/urls') : res.redirect('/login');
});

// HOMEPAGE -- LIST OF URLS
app.get("/urls", (req, res) => {
  if (!req.session.user_id) return res.redirect('/login');
  const userId = req.session.user_id;
  const user = users[userId];
  const urlsToShow = urlsForUser(urlDatabase, userId);
  const templateVars = { user, urlsToShow };
  res.render('urls_index', templateVars);
});

// CREATE NEW URL FORM
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) return res.redirect('/login');
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) return res.redirect('/login');
  const userId = req.session.user_id;
  const randomShort = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[randomShort] = { longURL, userId };
  res.redirect(`/urls/${randomShort}`);
});

// INDIVIDUAL PAGE FOR EACH URL + EDIT FORM
app.get("/urls/:shortURL", (req, res) => { // Show page for one URL
  if (!req.session.user_id) return res.redirect('/login');
  const userId = req.session.user_id;
  const user = users[userId];
  const urlsToShow = urlsForUser(urlDatabase, userId);
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL].longURL) res.send('This URL is not in our database');
  if (!userOwnsURL(shortURL, urlDatabase, userId)) res.send('You have no access to this URL');
  const longURL = urlsToShow[shortURL].longURL;
  const templateVars = {
    shortURL,
    longURL,
    user
  };
  res.render('urls_show', templateVars);
});

// EDIT URL FORM
app.post('/urls/:shortURL', (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const newURL = req.body.newURL;
  if (!userOwnsURL(shortURL, urlDatabase, userId)) return res.send('You have no access to this URL'); // if user doesn't own this URL
  urlDatabase[shortURL].longURL = newURL;
  res.redirect('/urls');
});

// REDIRECT TO LONG URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userId = req.session.user_id;
  if (!userOwnsURL(shortURL, urlDatabase, userId)) return res.send('You have no access to this URL');
  res.redirect(longURL);
});

// DELETE URL
app.post('/urls/:shortURL/delete', (req, res) => {
  if (!req.session.user_id) return res.redirect('/login'); // if not logged in
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  if (!userOwnsURL(shortURL, urlDatabase, userId)) res.send('You have no access to this URL'); // if doesn't own this URL
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// LOGIN
app.get('/login', (req, res) => {
  if (req.session.user_id) return res.redirect('/urls');
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userTryingToLogin = getUserByEmail(email, users);
  const result = authentification(email, password, users, userTryingToLogin);
  if (result.error) return res.send(result.error);
  const user = result.data;
  req.session.user_id = user.id;
  res.redirect('/urls');
});

// REGISTER
app.get("/register", (req, res) => {
  if (req.session.user_id) return res.redirect('/urls');
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { users, user };
  res.render("urls_registration", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    const statusCode = 400;
    return res.send(`${statusCode}: There is an empty field`);
  }
  if (getUserByEmail(email, users)) {
    const statusCode = 403;
    return res.send(`${statusCode}: This email already exists`);
  }
  const id = generateRandomString(6);
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.user_id = id;
  res.redirect('/urls');
});

// LOGOUT
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
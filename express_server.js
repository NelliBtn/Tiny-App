const express = require("express");
const app = express(); // pretty much 'Create server'
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.set("view engine", "ejs"); // tells the Express app to use EJS as its templating engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get('/showme.json', (req, res) => {
  res.json(users);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// HOMEPAGE -- LIST OF URLS
app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id']
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user }
  res.render('urls_index', templateVars); // to pass the URL data to our template.
});

// CREATE NEW URL FORM
app.get("/urls/new", (req, res) => { // create new form
  const userId = req.cookies['user_id']
  const user = users[userId];
  const templateVars = { user }
  res.render("urls_new", templateVars);
});

function generateRandomString(length) {
  return Math.random().toString(36).substr(2, length)
}

app.post("/urls", (req, res) => { // is not accessable from client side -- creates new url
  console.log(req.body);  // Log the POST request body to the console
  const randomShort = generateRandomString(6);
  urlDatabase[randomShort] = req.body.longURL;
  console.log(urlDatabase)
  const longURL = urlDatabase[randomShort]
  res.redirect('/urls');         // Respond with 'Ok' (we will replace this)
});

// INDIVIDUAL PAGE FOR EACH URL + EDIT FORM
app.get("/urls/:shortURL", (req, res) => { // 'tiny url for: ... short url:...'
  const userId = req.cookies['user_id']
  const user = users[userId];
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users,
    user
  };
  res.render('urls_show', templateVars); // to pass the URL data to our template.
});

// EDIT URL FORM
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.newURL;
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls') // index
});

// DELETE URL
app.post('/urls/:shortURL/delete', (req, res) => { // not accesable from client side
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

const getUserByEmail = function (email) {
  for (let user in users) {
    if (users[user]['email'] === email) {
      return users[user]; //object
    }
  }
}

// LOGIN
app.post('/login', (req, res) => {
  const email = req.body.username;
  console.log(req.body)
  const user = getUserByEmail(email); //object??
  console.log(user)
  res.cookie('user_id', user.id);
  res.redirect('/urls')
});

// LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
});

// REGISTER
app.get("/register", (req, res) => {
  const userId = req.cookies['user_id']
  const user = users[userId];
  const templateVars = { users, user }
  console.log(user)
  res.render("urls_registration", templateVars);
});


app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString(6);
  users[id] = {
    id,
    email,
    password
  };
  res.cookie('user_id', id);
  res.redirect('/urls');
});




app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
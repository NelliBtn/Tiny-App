const express = require("express");
const app = express(); // pretty much 'Create server'
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.set("view engine", "ejs"); // tells the Express app to use EJS as its templating engine

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: 'userIdExample1'},
  "9sm5xK": {longURL: "http://www.google.com", userId: 'userIdExample2'}
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
  },
  'dino': {
    id: 'dino',
    email: 't@rex.com',
    password: 'dino'
  }
}

app.get('/showme.json', (req, res) => {
  res.json(urlDatabase);
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
  if (Object.keys(req.cookies).length === 0) {
    return res.redirect('/login');
  }
  const userId = req.cookies.user_id;
  const randomShort = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[randomShort] = { longURL, userId };
  // const longURL = urlDatabase[randomShort].longUrl;
  res.redirect('/urls');         // Respond with 'Ok' (we will replace this)
});

// INDIVIDUAL PAGE FOR EACH URL + EDIT FORM
app.get("/u/:shortURL", (req, res) => { // 'tiny url for: ... short url:...'
  const userId = req.cookies['user_id']
  const user = users[userId];
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
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
  } return false;
}

// LOGIN
app.get('/login', (req, res) => {
  const userId = req.cookies['user_id']
  const user = users[userId];
  const templateVars = { user }
  res.render('urls_login', templateVars)
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email); //object!
  const password = req.body.password;
  // email cant be found
  if (!email || !password) {
    res.statusCode = 400;
    return res.send(`${res.statusCode}: There is an empty field`) // 400 status code
  }
  if (!getUserByEmail(email)) {
    res.statusCode = 403;
    return res.send(`${res.statusCode}: This email is not found`); // 403
  }
  if (getUserByEmail(email).password !== password) {
    res.statusCode = 403;
    return res.send(`${res.statusCode}: Wrong password`) // 403 status code.
  }
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
  res.render("urls_registration", templateVars);
});


app.post('/register', (req, res) => {
  // if email or password are empty strings => a response with the 400 status code
  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    return res.send(`${res.statusCode}: There is an empty field`) // how to make 400?
  }
  // if email alreadu exists. need to do in other routes as well (helper function)
  if (getUserByEmail(req.body.email)) {
    res.statusCode = 400;
    return res.send(`${res.statusCode}: This email already exists`)
  }

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
const express = require("express");
const app = express(); // pretty much 'Create server'
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs"); // tells the Express app to use EJS as its templating engine

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: 'userIdExample1'},
  "9sm5xK": {longURL: "http://www.google.com", userId: 'userIdExample2'},
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
}

app.get('/showme.json', (req, res) => {
  res.json(users);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

const urlsForUser = (urlDatabase, id) => {
  let urlsForUserObj = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === id) {
      urlsForUserObj[url] = urlDatabase[url];
    }
  } return urlsForUserObj;
};

const generateRandomString = (length) => {
  return Math.random().toString(36).substr(2, length)
};

const getUserByEmail = function (email) {
  for (let user in users) {
    if (users[user]['email'] === email) {
      return users[user]; //object
    }
  } return false;
};


//AUTHENTIFICATION FOR LOGIN
const authentification = (email, password) => {
  const user = getUserByEmail(email);
  if (user && bcrypt.compareSync(password, user.password)) { // input password vs object password
    return { data: user, error: null };
  };

  if (!email || !password) {
  res.statusCode = 400;
  return { data: null, error: res.send(`${res.statusCode}: There is an empty field`)};
  } else if (!getUserByEmail(email)) {
    res.statusCode = 403;
    return { data: null, error: res.send(`${res.statusCode}: This email is not found`)};
  } else if (getUserByEmail(email).password !== password) {
    res.statusCode = 403;
    return { data: null, error: res.send(`${res.statusCode}: Wrong password`)};
  };
};





// HOMEPAGE -- LIST OF URLS
app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id']
  const user = users[userId];
  const urlsToShow = urlsForUser(urlDatabase, userId);
  const templateVars = { user, urlsToShow }
  res.render('urls_index', templateVars); // to pass the URL data to our template.
});

// CREATE NEW URL FORM
app.get("/urls/new", (req, res) => { // create new form
  const userId = req.cookies['user_id']
  const user = users[userId];
  const templateVars = { user }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => { // is not accessable from client side -- creates new url
  if (Object.keys(req.cookies).length === 0) {
    return res.redirect('/login');
  }
  const userId = req.cookies.user_id;
  const randomShort = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[randomShort] = { longURL, userId };
  res.redirect('/urls');         // Respond with 'Ok' (we will replace this)
});

// INDIVIDUAL PAGE FOR EACH URL + EDIT FORM
app.get("/u/:shortURL", (req, res) => { // 'tiny url for: ... short url:...'
  if (Object.keys(req.cookies).length === 0) {
    return res.redirect('/login');
  }
  const userId = req.cookies['user_id'];
  const user = users[userId];
  const urlsToShow = urlsForUser(urlDatabase, userId);
  const shortURL = req.params.shortURL;

    if (!urlsToShow.hasOwnProperty(shortURL)) { // shortURL is in  this object
      return res.send('You have no access to this URL')
    }

  const longURL = urlsToShow[shortURL].longURL;
  const templateVars = { 
    shortURL,
    longURL,
    user
  };
  res.render('urls_show', templateVars); // to pass the URL data to our template.
});

// EDIT URL FORM
app.post('/urls/:shortURL', (req, res) => {
  const userId = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL].userId !== userId) {
    return res.send('You cannot edit this URL')
  }
  const newURL = req.body.newURL;
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls') // index
});

// DELETE URL
app.post('/urls/:shortURL/delete', (req, res) => { // not accesable from client side
  const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  if (!urlDatabase[shortURL].userId !== userId) {
    return res.send('You cannot delete this URL')
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// LOGIN
app.get('/login', (req, res) => {
  const userId = req.cookies['user_id']
  const user = users[userId];
  const templateVars = { user }
  res.render('urls_login', templateVars)
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const result = authentification(email, password);
  if (result.error) {
    return res.send(result.error);
  };
  const user =  result.data;
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
    password: bcrypt.hashSync(password, 10)
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
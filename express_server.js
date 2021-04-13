const express = require("express");
const app = express(); // pretty much 'Create server'
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs"); // tells the Express app to use EJS as its templating engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// HOMEPAGE -- LIST OF URLS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }
  res.render('urls_index', templateVars); // to pass the URL data to our template.
});

/*
Need to send them inside an object, even if we are only sending one variable.
This is so we can use the key of that variable (in the above case the key is urls)
to access the data within our template.
*/

// CREATE NEW FORM
app.get("/urls/new", (req, res) => { // create new form
  res.render("urls_new");
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars); // to pass the URL data to our template.
});

// EDIT FORM
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.newURL;
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls') // index
});

// DELETE
app.post('/urls/:shortURL/delete', (req, res) => { // not accesable from client side
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});




app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
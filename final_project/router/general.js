const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooks = new Promise((resolve, reject) => {
  try {
    let booksList = books;
    resolve(booksList);
  } catch (err) {
    reject(err)
  }
});

const getBooksByISBN = (isbn) => {
  return books[isbn];
};

var getBooksByAuthor = function (author) {
  return new Promise(function (resolve, reject) {
    try {
      var filtered = Object.keys(books).reduce(function (filtered, key) {
        if (books[key]["author"] == author) filtered[key] = books[key];
        return filtered;
      }, {});
      resolve(filtered);
    } catch (err) {
      reject(err)
    }
  });
};

const getBooksByTitle = (title) => {
  var filtered = Object.keys(books).reduce(function (filtered, key) {
    if (books[key]["title"] == title) filtered[key] = books[key];
    return filtered;
  }, {});

  return filtered;
};

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log(username);
  console.log(password);

  if (username && password) {
    if (isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  getBooks.then(
    (data) => res.send(JSON.stringify(data, null, 4)),
    (err) => res.send("Could not get the books.")
  );
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const booksByISBN = await getBooksByISBN(req.params.isbn);
  res.send(JSON.stringify(booksByISBN, null, 4));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  getBooksByAuthor(req.params.author).then(
    (data) => res.send(JSON.stringify(data, null, 4)),
    (err) => res.send("Could not get the books by author.")
  );
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const booksByTitle = await getBooksByTitle(req.params.title);
  res.send(JSON.stringify(booksByTitle, null, 4));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  res.send(JSON.stringify(books[req.params.isbn]["reviews"], null, 4));
});

module.exports.general = public_users;

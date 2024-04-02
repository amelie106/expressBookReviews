const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let usersWithSameName = users.filter((user) => {
    return user.username === username
  });
  return usersWithSameName.length == 0;
}

const authenticatedUser = (username, password) => {
  let hasValidLogin = users.filter((user) => {
    return user.username === username && user.password === password
  });
  return hasValidLogin.length == 1;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization['username'];
  const review = req.query.review;

  if (books[req.params.isbn]["reviews"][username] === undefined) {
    books[req.params.isbn]["reviews"][username] = review;
    res.send("Review by user " + username + " was added.");
  } else {
    books[req.params.isbn]["reviews"][username] = review;
    res.send("Review by user " + username + " was modified.");
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization['username'];

  if (books[req.params.isbn]["reviews"][username] === undefined) {
    res.send("No review to be deleted.");
  } else {
    delete books[req.params.isbn]["reviews"][username];
    res.send("Review was deleted.");
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

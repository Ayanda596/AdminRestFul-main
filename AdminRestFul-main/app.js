const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Set up the public folder for static assets
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware to parse POST request data
app.use(bodyParser.urlencoded({ extended: true }));

// Route for the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route to handle login form submission
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Add your authentication logic here (e.g., check against a database)
  // For demonstration purposes, check if the username and password are both "admin"
  if (username === 'admin' && password === 'admin') {
    res.send('Login successful!');
  } else {
    res.send('Login failed. Please check your credentials.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

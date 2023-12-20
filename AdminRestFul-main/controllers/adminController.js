const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

const app = express();
const port = 3003;

app.use(cors());
app.use(bodyParser.json());

const saltRounds = 10;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = 'login-cred';
const collectionName = 'Admins';

let db;

async function connectToDatabase() {
  try {
    const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}
// ...

// Update the values of username and password
process.env.USERNAME = "Ayanda";
process.env.PASSWORD = "Ayanda2001!";

async function initializeUser() {
  try {
    const user = await db.collection(collectionName).findOne({ username: process.env.USERNAME });

    if (!user) {
      // Generate a new salt
      const saltRounds = 10; // You can adjust the number of rounds as needed
      const salt = await bcrypt.genSalt(saltRounds);

      // Hash the password using the generated salt
      const passwordHash = await bcrypt.hash(process.env.PASSWORD, salt);

      // Insert the user into the database with only the hashed password
      await db.collection(collectionName).insertOne({
        username: process.env.USERNAME,
        passwordHash,
      });

      console.log('User initialized successfully');
    } else {
      console.log('User already exists');
    }
  } catch (error) {
    console.error('Error initializing user:', error);
    throw error;
  }
}

// ...

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Assuming you have a database with user information
    // Here, you would query the database to get the user's stored hash
    const user = await db.collection(collectionName).findOne({ username });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Wrong username or password' });
    }

    // Compare the provided password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (passwordMatch) {
      // Passwords match, create a JWT token
      const token = jwt.sign({ username }, process.env.SECRET_KEY, { expiresIn: '1h' });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: 'Wrong username or password' });
    }
  } catch (error) {
    console.error('Error processing login request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// ...


// Protected route
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Invalid token' });
    }

    req.user = decoded;
    next();
  });
};

app.get('/api/admin/login', verifyToken, (req, res) => {
  res.json({ success: true, message: 'This is a protected route', user: req.user });
});

// Start the server
app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await connectToDatabase();
  await initializeUser();
});

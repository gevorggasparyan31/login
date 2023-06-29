const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors')

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


// MongoDB connection URI
const mongoURI = 'mongodb://localhost:27017/login-authentication';

// Define a Mongoose schema for the user
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
});

// Create a Mongoose model based on the schema
const User = mongoose.model('User', userSchema);

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    // Create the users in the database
    createUsers();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Function to create the users in the database
const createUsers = async () => {
  try {
    await User.deleteMany(); // Remove any existing users

    const users = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'user', password: 'user123', role: 'ordinary' }
    ];

    await User.insertMany(users);
    console.log('Users added to the database');
  } catch (err) {
    console.error('Error creating users:', err);
  }
};

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username, password })
    .then((user) => {
      if (user) {
        if (user.role === 'admin') {
          res.json({ message: 'Hello Admin' });
        } else {
          res.json({ message: 'Ordinary User' });
        }
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    })
    .catch((err) => {
      console.error('Error finding user:', err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.get('/login', (req,res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});

require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); 


const app = express();


app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    phone: String,
    gender: String,
    hearAbout: [String],
    city: String,
    state: String,
  },
  { timestamps: true } 
);

const User = mongoose.model('User', userSchema);

// Middleware to parse JSON
app.use(bodyParser.json());

// Route to handle the form submission
app.post('/api/saveFormData', async (req, res) => {
  try {
    const formData = req.body;

    const existingUser = await User.findOne({ email: formData.email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use', message: 'Email is already in use' });
    }
    const newUser = new User(formData);
    await newUser.save();
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/getAllUsers', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/getUserDetails/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    // Fetch user details from the database
    const userDetails = await User.findById(userId);
    // Check if user details were found
    if (!userDetails) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Send the user details in the response
    res.status(200).json(userDetails);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      // User not found
      return res.status(401).json({ message: 'Email not registered' });
    }

    // Check if the password is correct
    if (user.password !== password) {
      // Incorrect password
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    // User found, send a success response
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.delete('/api/deleteUser/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

   
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send a success response
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting particular user', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


app.put('/api/updateUser/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedUserData = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
      new: true, // Return the updated document
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

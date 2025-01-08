const mongoose = require('mongoose');

mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:', err);
});

const mongoURI = 'mongodb+srv://gym:workout@cluster0.ie8js.mongodb.net/Gym-Admin?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      connectTimeoutMS: 30000, // Increase timeout to 30 seconds
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit if the connection fails
  }
};

module.exports = connectDB;

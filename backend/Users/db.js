const mongoose = require('mongoose');

mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:', err);
});

// for the below url, paste the mongodb uri link 
const mongoURI = //mongodb uri link;

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

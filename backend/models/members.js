const mongoose = require('mongoose');

// Define the schema for a Member
const memberSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  memno: { type: Number, required: true, unique: true },
  memphno: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  doj: { type: String, required: true },
  doe: { type: String, required: true },
  plan: { type: String, required: true },
  price: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User

  
});

// Create a model
module.exports = mongoose.model('Members', memberSchema, 'members');

const mongoose = require('mongoose');

// Define the schema for a Member
const employeeSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  emno: { type: Number, required: true, unique: true },
  emphno: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  doj: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User

  
});

// Create a model
module.exports = mongoose.model('Employees', employeeSchema, 'employees');

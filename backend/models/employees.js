const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Password validation regex (for example, check for special characters)
const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;  // At least one special character


// Define the schema for a Member
const employeeSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  emno: { type: Number, required: true},
  emphno: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  doj: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
  password: { type: String }, // Password field added to schema
  passwordResetToken : String,
  passwordResetExpires: Date
});

employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Password validation: ensure it contains at least one special character
  if (!passwordRegex.test(this.password)) {
    const error = new Error('Password must contain at least one special character.');
    return next(error);
  }

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword; // Save the hashed password
    next();
  } catch (err) {
    console.error('Error hashing password:', err);
    next(err); // Pass the error to the next middleware (will be handled by the server)
  }
});

// Compare entered password with hashed password
employeeSchema.methods.isValidPassword = async function (password) {
  const trimmedPassword = password.trim();  // Trim any whitespace
  return await bcrypt.compare(trimmedPassword, this.password);
};





// Create a model
module.exports = mongoose.model('Employees', employeeSchema, 'employees');

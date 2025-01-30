const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Password validation regex (for example, check for special characters)
const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;  // At least one special character

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordResetToken : String,
  passwordResetExpires: Date
});

// Hash password before saving
userSchema.pre('save', async function (next) {
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
userSchema.methods.isValidPassword = async function (password) {
  const trimmedPassword = password.trim();  // Trim any whitespace
  return await bcrypt.compare(trimmedPassword, this.password);
};

const User = mongoose.model('User', userSchema, 'admin'); // 'admin' is the collection name
module.exports = User;

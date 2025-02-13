const mongoose = require('mongoose');

// Define the email schema with totalPrice
const renewalSchema = new mongoose.Schema({
  memno: { type: Number, required: true}, // memno as a required field
  email: { type: String, required: true}, // email should be unique and required
  fullname: { type: String, required: true }, // fullname as a required field
  packages: [{
    plan: { type: String, required: true }, // plan as a required field
    price: { type: Number, required: true }, // price as a required field
    dos: { type: String, required: true }, // dos (date of start) as Date type
    doe: { type: String, required: true },  // doe (date of end) as Date type
  }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User

  //totalPrice: { type: String, required: true }, // totalPrice as a required field (calculated later)
});

// Create the model from the schema
const Email = mongoose.model('Email', renewalSchema, 'renewals');

module.exports = Email;

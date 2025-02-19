const mongoose = require('mongoose');

const addplanSchema = new mongoose.Schema({

  planname:{ type: String, required: true }, 
  validity:{ type: Number, required: true }, 
  amount: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User

});

module.exports = mongoose.model('AddPlan', addplanSchema);

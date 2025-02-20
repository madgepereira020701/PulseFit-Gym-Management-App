const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    department: { type: String, required: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
});

module.exports = mongoose.model('departments', departmentSchema);

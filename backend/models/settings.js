const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    member_h_r: { type: Number , default: 0},
    employee_h_r: { type: Number , default: 0},   
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User

})

const Settings = mongoose.model('Settings', settingSchema);

module.exports = Settings;
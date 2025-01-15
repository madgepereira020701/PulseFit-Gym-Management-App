const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: {type: String, required: true},
    in_time: {type: String, required: true},
    out_time: { type: String, default: null }, // Make out_time optional
    user_type: {type: String, required: true},
    user_id: {type: Number, required: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User

});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;




const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: {type: String, required: true},
    in_time: {type: String, required: true},
    out_time: {type: String, required: true},
    memno: {type: Number, required: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User

});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;




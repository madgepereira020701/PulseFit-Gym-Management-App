
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventDate: String,
  eventName: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User

});

const Event = mongoose.model('events', eventSchema);


module.exports = Event;






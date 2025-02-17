const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://gym:workout@cluster0.ie8js.mongodb.net/Gym-Admin?retryWrites=true&w=majority&appName=Cluster0';
const Employee = require('../models/employees');
const Event = require('../models/addevent');
const Members = require('../models/members');


  const addEvents =  async (req, res) => {
    console.log(req.body); // Log the request body to see if eventName is coming in
  
    const { eventName } = req.body;
  
    if (!eventName) {
      return res.status(400).json({ status: 'ERROR', message: 'Event name is required' });
    }
  
    try {
      const eventDate = req.body.eventDate || new Date();
      const formattedEventDate = moment(eventDate).format('YYYY-MM-DD');
  
      const newEvent = new Event({
        eventDate: formattedEventDate,
        eventName,
        userId: req.user,
      });
  
      await newEvent.save();
  
      res.status(200).json({
        status: 'SUCCESS',
        message: 'Event added successfully',
        event: newEvent,
      });
    } catch (error) {
      console.error('Error adding event:', error);
      res.status(500).json({ status: 'ERROR', message: 'Error adding event' });
    }
  };
  
  const getEvents = async (req, res) => {
    try {
      const events = await Event.find({ userId: req.user});
      console.log(events);  // Log the fetched events
      if (events.length === 0) {
        return res.status(404).json({ status: 'ERROR', message: 'No events found' });
      }
      res.status(200).json({ status: 'SUCCESS', events });
    } catch (error) {
      console.error('Error fetching events:', error);  // Log any errors
      res.status(500).json({ status: 'ERROR', message: 'Error fetching events' });
    }
  };
  
  const deleteEvents = async(req,res) => {
    const eventName = req.params.eventName;
  
    try{
      const result = await Event.deleteOne({eventName: eventName} );
  
      if(result.deletedCount === 0)
      {
        return res.status(404).json({message: 'Event is not found.'});
      }
  
      return res.status(200).json({message: 'Event deleted successfully.'});
  
    } catch (error)
    {
      return res.status(500).json({message: 'Could not delete member.', error});
  
    }
  };

  const getEmployeeEvents =  async (req, res) => {
    try {
      // Get the logged-in employee's email from the session or token
      const employeeEmail = req.user.email;
  
      // Find the employee in the database
      const employee = await Employee.findOne({ email: employeeEmail });
      if (!employee) {
          return res.status(404).json({ status: 'ERROR', message: "Employee not found" });
      }
  
      // Get the admin's userId who added this employee
      const adminUserId = employee.userId;
  
      // Find all events added by this admin
      const events = await Event.find({ userId: adminUserId });
  
      if (events.length === 0) {
        return res.status(404).json({ status: 'ERROR', message: 'No events found for this employee' });
      }
  
      // Return events to the client with status SUCCESS
      res.status(200).json({ status: 'SUCCESS', events });
    } catch (error) {
      console.error('Error fetching events for employees:', error);
      res.status(500).json({ status: 'ERROR', message: 'Error fetching events for employees' });
    }
  };
  
  
  const getMemberEvents =  async (req, res) => {
    try {
        // Get the logged-in employee's email from the session or token
        const memberEmail = req.user.email;
  
        // Find the employee in the database
        const member = await Members.findOne({ email: memberEmail });
        if (!member) {
            return res.status(404).json({ message: "Employee not found" });
        }
  
        // Get the admin's userId who added this employee
        const adminUserId = member.userId;
  
        // Find all events added by this admin
        const events = await Event.find({ userId: adminUserId });
  
        // Return events to the client
        if (events.length === 0) {
          return res.status(404).json({ status: 'ERROR', message: 'No events found for this employee' });
        }
    
        // Return events to the client with status SUCCESS
        res.status(200).json({ status: 'SUCCESS', events });
      } catch (error) {
        console.error('Error fetching events for employees:', error);
        res.status(500).json({ status: 'ERROR', message: 'Error fetching events for employees' });
      }
  };
  

exports.addEvents = addEvents;
exports.getEvents = getEvents;
exports.deleteEvents = deleteEvents;
exports.getMemberEvents = getMemberEvents;
exports.getEmployeeEvents = getEmployeeEvents;


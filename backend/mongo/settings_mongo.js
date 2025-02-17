const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://gym:workout@cluster0.ie8js.mongodb.net/Gym-Admin?retryWrites=true&w=majority&appName=Cluster0';
const Employee = require('../models/employees');
const Settings = require('../models/settings');
const Members = require('../models/members');
const Event = require('../models/addevent');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const moment = require('moment');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'madgepereira020701@gmail.com',
      pass: 'xezg tgdr tods jpbc', // Use an app-specific password for Gmail
    },
  });
  
  transporter.verify((error) => {
    if (error) {
      console.error('Error configuring email transporter:', error);
    } else {
      console.log('Ready to send emails.');
    }
  });
  
const sendReminderEmail = async (email, eventName) => {
    const mailOptions = {
        from: 'madgepereira020701@gmail.com',
        to: email,
        subject: `Reminder: ${eventName}`,
        text: `This is a reminder about your holiday: ${eventName}`,
    };
  
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
  };
  
  const getUpcomingEvents = async (date) => {
    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
  
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
  
        const events = await Event.find({
            eventDate: { $gte: startOfDay, $lt: endOfDay },
        }).exec();
  
        return events;
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        throw new Error('Unable to fetch events');
    }
  };
  
  const getUserSettings = async (userId) => {
    try {
        const userSettings = await Settings.findOne({ userId }).exec();
        if (!userSettings) {
            console.log(`No settings found for userId: ${userId}`);
            return null;
        }
        return userSettings;
    } catch (error) {
        console.error('Error fetching user settings:', error);
        throw new Error('Unable to fetch user settings');
    }
  };
  
const updateSettings =  async (req, res) => {
    const { sendToMembers, sendToEmployees } = req.body;
    const member_h_r = sendToMembers ? 1 : 0;
    const employee_h_r = sendToEmployees ? 1 : 0;
  
    const userId = req.user;
  
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }
  
    try {
        const settings = await Settings.findOneAndUpdate(
            { userId }, // Query condition
            { member_h_r, employee_h_r },
            { new: true, upsert: true }
        );
  
        console.log('Updated settings:', settings);
        res.json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
  };
  
  cron.schedule('* * * * *', async () => {
    try {
      console.log("Starting holiday reminder cron job...");
  
      const today = moment();
      const tomorrow = moment(today).add(1, 'days').startOf('day').format('YYYY-MM-DD');
  
      // Check if tomorrow is a holiday
      const holidayTomorrow = await getUpcomingEvents(tomorrow);
  
      if (!holidayTomorrow) {
        console.log("Tomorrow is not a holiday. No reminders required.");
        return;
      }
  
      console.log("Tomorrow is a holiday. Sending reminders...");
  
      // Fetch events for tomorrow
      const events = await Event.find({
        eventDate: tomorrow
      });
  
      // Loop through each event and send reminders
      for (const event of events) {
        const userId = event.userId;
  
        // Fetch user settings
        const userSettings = await getUserSettings(userId);
  
        if (userSettings ) {
          console.log(`Sending reminders for event: "${event.eventName}" (User: ${userId})`);
  
          // Send reminders to members if member_h_r = 1
          if (userSettings.member_h_r === 1) {
            const members = await Members.find({ userId });
            for (const member of members) {
              await sendReminderEmail(member.email, event.eventName);
              console.log(`Reminder sent to member: ${member.email}`);
            }
          }
  
          // Send reminders to employees if employee_h_r = 1
          if (userSettings.employee_h_r === 1) {
            const employees = await Employee.find({ userId });
            for (const employee of employees) {
              await sendReminderEmail(employee.email, event.eventName);
              console.log(`Reminder sent to employee: ${employee.email}`);
            }
          }
        } else {
          console.log(`No reminders enabled for user: ${userId}`);
        }
      }
  
      console.log("Holiday reminder cron job completed.");
    } catch (error) {
      console.error("Error in holiday reminder cron job:", error);
    }
  });
  
  
  // Fetch Employees
  
  // Combined Logic for Members and Employees
 const getsettings = async (req, res) => {
    try {
        const { member_h_r, employee_h_r } = await Settings.findOne({}) || { member_h_r: 0, employee_h_r: 0 };
  
        let members = [];
        let employees = [];
  
        if (member_h_r === 1 && employee_h_r === 0) {
            members = await Members.find({ userId: req.user });
            res.status(200).json({ members });
        } else if (member_h_r === 0 && employee_h_r === 1) {
            employees = await Employee.find({ userId: req.user });
            res.status(200).json({ employees });
        } else if (member_h_r === 1 && employee_h_r === 1) {
            members = await Members.find({ userId: req.user });
            employees = await Employee.find({ userId: req.user });
            res.status(200).json({ members, employees });
        } else {
            res.status(400).json({ message: 'Invalid condition' });
        }
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ message: 'Server error' });
    }
  };
          
          


exports.updateSettings = updateSettings;
exports.getsettings = getsettings;

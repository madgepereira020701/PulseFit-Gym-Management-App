const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const connectDB = require('./Users/db'); // Database connection
const Members = require('./models/members'); // Schema for members
const Event = require('./models/addevent'); // Corrected model import
const Settings = require('./models/settings');
const Employee = require('./models/employees');
const Attendance = require('./models/attendance');


 // Schema for members
const mongoPlans = require('./mongo/addplan_mongo'); // Assuming plans API is in this file
const mongoMember = require('./mongo/member_mongo');
const mongoEmployee = require('./mongo/employee_mongo');
const mongoAttendance = require('./mongo/addattendance_mongo');




const moment = require('moment');


const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3001', // Replace with your frontend URL
  credentials: true,
}));
app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Nodemailer Transporter Configuration
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

// Utility function to send email
const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: 'madgepereira020701@gmail.com',
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Endpoint to Add Member and Send Emailconst moment = require('moment'); // For date manipulation
const axios = require('axios'); // Make sure to install axios


//MEMBERS
const protect = require('./Users/middlewares/authmiddleware'); // Import the middleware
const protect1 = require('./Users/middlewares/memmiddleware'); // Import the middleware
const protect2 = require('./Users/middlewares/emmiddleware'); // Import the middleware


// Add the middleware to the POST /members route to authenticate the admin
app.post('/members', protect, async (req, res) => {
  console.log('Packages recieved:', req.body.packages);
  const { memno, email, memphno, fullname, packages} = req.body;
  const userId = req.user;

  // Get token from Authorization header
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
      return res.status(400).json({ status: 'ERROR', message: 'Token not provided' });
  }

  // Fetch available plans for the logged-in user
  try {
    

      const response = await axios.get('http://localhost:3000/addplans', {
          headers: { Authorization: `Bearer ${token}` }
      });
      const availablePlans = response.data.filter(plan => plan.userId === userId);
      const savedPackages = [];
      let paymentdate = moment().format('YYYY-MM-DD');
      
      for(const packageItem of packages){
        const { plan, price, doj,doe } = packageItem;
      

      const selectedPlan = availablePlans.find(
        (p) =>
          p.planname &&
          plan &&
          p.planname.trim().toLowerCase() === plan.trim().toLowerCase()
      );
      if (!selectedPlan) {
          console.log('No matching plan found.');
          return res.status(400).json({ status: 'ERROR', message: 'Invalid plan selected for this user' });
      }


       // Calculate end date (doe) based on the plan's validity
  let calculatedDoe;
  try {
      const startDate = moment(doj, 'YYYY-MM-DD');
      calculatedDoe = startDate.add(selectedPlan.validity, 'months').format('YYYY-MM-DD');
  } catch (error) {
      console.error('Error calculating end date:', error);
      return res.status(500).json({ status: 'ERROR', message: 'Error calculating end date' });
  }
  const newPackage = {
    plan: selectedPlan.planname,
    price: parseFloat(price),
    doj: doj,
    doe: calculatedDoe,
    paymentdate: paymentdate
  };
   savedPackages.push(newPackage);
  } 

  // Check if the plan exists in the available plans


  // Prepare and send email content
  let emailContent = `
      <h3>Hello ${fullname},</h3>
      <p>Member ID: ${memno}</p>
      <p>Member Phone Number: ${memphno}</p>
      <p>Your subscription details are as follows:</p>
      <table border="1" style="border-collapse: collapse; width: 100%; text-align: left;">
          <thead>
              <tr>
                  <th>Plan</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Price</th>
              </tr>
          </thead>
          <tbody>`;

          savedPackages.forEach(pkg => {
            emailContent +=`
              <tr>
                  <td>${pkg.plan}</td>
                  <td>${pkg.doj}</td>
                  <td>${pkg.doe}</td>
                  <td>${pkg.price}</td>
              </tr>`;
          });

          emailContent += `
          </tbody>
      </table>
  `;
  const emailSent = await sendEmail(email, 'Congratulations on Your Membership', emailContent);

  if (!emailSent) {
      console.error('Error sending email');
      return res.status(500).json({ status: 'ERROR', message: 'Error sending email' });
  }

  // Save the new member details
  
      const newMember = new Members({
          memno,
          email,
          fullname,
          memphno,
          packages: savedPackages,
          userId
      });

      await newMember.save();

      console.log('Member details saved:', newMember);

      res.status(200).json({
          status: 'SUCCESS',
          message: 'Email sent and member details saved successfully',
          memberDetails: newMember,
      });
  } catch (error) {
      console.error('Error saving member:', error);
      return res.status(500).json({ status: 'ERROR', message: 'Error saving member details' });
  }
});



app.get('/members', protect,async (req, res) => {
  try {
    const members = await Members.find({ userId: req.user });
    res.status(200).json({ status: 'SUCCESS', data: members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ status: 'ERROR', message: 'Error fetching members' });
  }
});

app.post('/addplans/:memno', protect, async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
      return res.status(400).json({ status: 'ERROR', message: 'Token not provided' });
  }
  try {
      const memno = req.params.memno;
      const newPackages = req.body.packages; 
      const userId = req.user;


      if (!newPackages || !Array.isArray(newPackages) || newPackages.length === 0) {
          return res.status(400).json({ message: 'Packages are required and must be a non-empty array' });
      }

      const updatedMember = await Members.findOne({ memno: memno }); 

      if (!updatedMember) {
          return res.status(404).json({ message: 'Member not found!' });
      }

      const response = await axios.get('http://localhost:3000/addplans', {
        headers: { Authorization: `Bearer ${token}` }
    });
      const availablePlans = response.data.filter(plan => plan.userId === userId);

      const savedPackages = [];
      let paymentdate = moment().format('YYYY-MM-DD');

      for (const packageItem of newPackages) {
          const { plan, price, doj } = packageItem; 

          const selectedPlan = availablePlans.find(p => p.planname === plan);

          if (!selectedPlan) {
              return res.status(400).json({ message: `Plan "${plan}" not found for this user.` });
          }

          let calculatedDoe;
          try {
              const startDate = moment(doj, 'YYYY-MM-DD'); 
              calculatedDoe = startDate.add(selectedPlan.validity, 'months').format('YYYY-MM-DD');
          } catch (error) {
              console.error('Error calculating end date:', error);
              return res.status(500).json({ message: 'Error calculating end date' });
          }

          const newPackage = {
              plan: selectedPlan.planname,
              price: parseFloat(price),
              doj: doj,
              doe: calculatedDoe,
              paymentdate: paymentdate
          };

          savedPackages.push(newPackage);
      }


      const result = await Members.findOneAndUpdate(
          { memno: memno },
          { $push: { packages: { $each: savedPackages } } },
          { new: true, runValidators: true }
      );

      if (!result) {
          return res.status(500).json({ message: "Failed to update member." });  // Or handle the error as needed
      }

      res.status(200).json(result);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/payments/:memno', protect,async (req, res) => {
  const { memno } = req.params;

  try {
    // Find the member based on memno in the "members" collection
    const member = await Members.findOne({ memno });

    if (!member) {
      return res.status(404).json({ status: 'ERROR', message: 'Member not found' });
    }

    // Find renewal details from the "renewal_email" collection
    

    // Construct the response JSON
    const paymentData = {
      memno: member.memno,
      email: member.email,
      fullname: member.fullname,
      memphno: member.memphno,
      packages:member.packages.map(package => ({
        plan: package.plan,
        price: package.price,
        doj: package.doj,
        doe: package.doe,
        paymentdate: package.paymentdate
      })) , // Handle cases where member.packages is undefined or not an array
  // Handle cases where renewals is undefined or not an array
      userId: req.user
    };

    // Send the JSON response
    res.status(200).json({
      status: 'SUCCESS',
      data: paymentData,
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ status: 'ERROR', message: 'Error fetching payment details' });
  }
});


// Endpoint to Update Member Details and Send Updated Email
app.patch('/members/:email',protect, async (req, res) => {
  const { email } = req.params;
  const { memphno, doj, doe, memno } = req.body;

  // Validate the required fields
  if (!memphno || !doj || !doe || !memno) {
    return res.status(400).json({ status: 'ERROR', message: 'Missing required fields: memphno, doj, and doe' });
  }

  try {
    // Find and update the member by email
    const updatedMember = await Members.findOneAndUpdate(
      { email },
      { memno, memphno, doj, doe },
      { new: true }  // This ensures the updated member data is returned
    );

    if (!updatedMember) {
      return res.status(404).json({ status: 'ERROR', message: 'Member not found' });
    }

    // Continue with email sending and response...
    const emailContent = `
      <h3>Hello ${updatedMember.fullname},</h3>
      <p>Member ID: ${memno}</p>
      <p>Your membership details have been updated. Here are your new subscription details:</p>
      <table border="1" style="border-collapse: collapse; width: 100%; text-align: left;">
        <thead>
          <tr>
            <th>Phone Number</th>
            <th>Start Date</th>
            <th>End Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${memphno}</td>
            <td>${doj}</td>
            <td>${doe}</td>
          </tr>
        </tbody>
      </table>
    `;

    const emailSent = await sendEmail(updatedMember.email, 'Your Membership Details Have Been Updated', emailContent);

    if (!emailSent) {
      return res.status(500).json({ status: 'ERROR', message: 'Error sending updated email' });
    }

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Member details updated and email sent successfully',
      updatedMember,
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ status: 'ERROR', message: 'Error updating member details', error });
  }
});




//RENEWALS
// Endpoint to Add Renewals and Send Email
app.post('/renewals/:memno', protect,async (req, res) => {


  const token = req.headers['authorization']?.split(' ')[1];
  if(!token) {
    return res.status(400).json({status: 'ERROR', message: 'Token not provided' });
  }

  //const totalPrice = dateGroups.reduce((total, group) => total + parseFloat(group.price), 0).toFixed(2);



  try {
    const memno = req.params.memno;
    console.log("req.body:", req.body); // <-- Crucial debugging step

    const newPackages = req.body.packages;
    const userId = req.user;



    if (!newPackages || !Array.isArray(newPackages) || newPackages.length === 0) {
      return res.status(400).json({ message: 'Packages are required and must be a non-empty array' });
  }

  

    const member  = await Members.findOne({memno: memno});
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
  }

    const response = await axios.get('http://localhost:3000/addplans', { 
       headers: { Authorization: `Bearer ${token}` }
    });
    const availablePlans = response.data.filter(plan => plan.userId === userId);
    const savedPackages = [];
    let paymentdate = moment().format('YYYY-MM-DD');

    for(const packageItem of newPackages) {
      const { plan, price, doj } = packageItem;

      const selectedPlan = availablePlans.find(
        (p) => p.planname && plan && p.planname.trim().toLowerCase() === plan.trim().toLowerCase()
      );
      if(!selectedPlan) {
        console.log('No matching plan found.');
        return res.status(400).json({ status: 'ERROR', message: 'Invalid plan selected for this user '});
      }
      let calculatedDoe;
      try {
        const startDate = moment(doj, 'YYYY-MM-DD');
        calculatedDoe = startDate.add(selectedPlan.validity, 'months').format('YYYY-MM-DD');
      } catch (error) {
        console.error('Error calculating end date', error);
        return res.status(500).json({ status: 'ERROR', message: 'Error calculating end date' });
      }
      const newPackage = {
        plan: selectedPlan.planname,
        price: parseFloat(price),
        doj: doj,
        doe: calculatedDoe,
        paymentdate: paymentdate
      }
      savedPackages.push(newPackage);




  let emailContent = `
  <h3>Hello ${member.fullname},</h3>
  <p>Member Number: ${member.memno}</p>
  <p>Your subscription details are as follows:</p>
  <table border="1" style="border-collapse: collapse; width: 100%; text-align: left;">
    <thead>
      <tr>
        <th>Plan</th>
        <th>Start Date</th>
        <th>End Date</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>`;

    savedPackages.forEach(pkg => {
      emailContent +=`
        <tr>
          <td>${pkg.plan}</td>
          <td>${pkg.doj}</td>
          <td>${pkg.doe}</td>
          <td>${pkg.price}</td>
        </tr>`;
        });
        emailContent += `
    </tbody>
  </table>
`;

const emailSent = await sendEmail(member.email, 'Plan Subscription Details', emailContent);

if (!emailSent) {
  return res.status(500).json({ status: 'ERROR', message: 'Error sending renewal email' });
}

}


    const newRenewal = await Members.findOneAndUpdate(
      { memno: memno },
      { $push: { packages: {$each: savedPackages}}},
      { new: true, upsert: true, runValidators: true }
    );

 


    res.status(200).json({
      status: 'SUCCESS',
      message: 'Email sent and renewal details saved successfully',
      //totalPrice,
      renewalDetails: newRenewal,
    });
  } catch (error) {
    console.error('Error saving renewal:', error);
    res.status(500).json({ status: 'ERROR', message: 'Error saving renewal details' });
  }
});

// Endpoint to Fetch Renewals
app.get('/renewals', protect, async (req, res) => {
  try {
    const renewals = await Members.find({userId: req.user});
    res.status(200).json({ status: 'SUCCESS', data: renewals });
  } catch (error) {
    console.error('Error fetching renewals:', error);
    res.status(500).json({ status: 'ERROR', message: 'Error fetching renewals' });
  }
});

const cron = require('node-cron');

cron.schedule('* * * * *', async () => { // Adjust cron schedule as needed
  try {
    const sevenDaysAhead = moment().add(7, 'days').startOf('day').format('YYYY-MM-DD');


    // 2. Find renewals where packages.doe is 7 days ahead
    const renewalsExpiringSoon = await Members.find({ "packages.doe": sevenDaysAhead }).populate('userId');

    // Combine and deduplicate based on memno
   
    console.log(sevenDaysAhead);
    console.log("Renewals starting soon:", renewalsExpiringSoon);

    for (const renewal of renewalsExpiringSoon) {
      const member = await Members.findOne({
        memno: renewal.memno,
        userId: renewal.userId // Ensure it matches the logged-in user
      }).select('fullname email');

      if (member) {
        let emailContent = `
          <h3>Hello ${member.fullname},</h3>
          <p>Your plan will expire within 7 days. Please subscribe if you want to continue your next plan.</p>
          <table border="1" style="border-collapse: collapse; width: 100%; text-align: left;">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${renewal.plan}</td>
                <td>${renewal.doj}</td>  
                <td>${renewal.doe}</td>
                <td>${renewal.price}</td>
              </tr>
            </tbody>
          </table>
          <p>Get ready to enjoy our services starting soon!</p>
        `;

        const emailSent = await sendEmail(member.email, 'Reminder: Your Subscription is Ending Soon', emailContent);

        if (emailSent) {
          console.log(`Reminder email sent to ${member.email}`);
        } else {
          console.error(`Failed to send reminder email to ${member.email}`);
        }
      } else {
        console.log(`No member found for memno: ${expiringItem.memno}`);
      }
    }
  } catch (error) {
    console.error('Error during cron job execution:', error);
  }
});

app.delete('/members/:memno', protect,mongoMember.deleteMember); // Delete member by memno

app.post('/employees',protect, mongoEmployee.addEmployees); // Add a new plan
app.get('/employees', protect, async (req, res) => {
  try {
    const userId = req.user;

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in request' });
    }

    const employees = await Employee.find({ userId });

    res.status(200).json({ employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.delete('/employees/:emno', protect, mongoEmployee.deleteEmployee); // Delete plan by amount
app.patch('/employees/:email', protect,mongoEmployee.updateEmployee); // Update plan by amount




//ADD PLANS
app.post('/addplans',protect, mongoPlans.addPlans); // Add a new plan
app.get('/addplans', protect,mongoPlans.getPlans); // Fetch all plans
app.delete('/addplans/:planname', protect, mongoPlans.deletePlan); // Delete plan by amount
app.patch('/addplans/:planname', protect,mongoPlans.updatePlan); // Update plan by amount

//app.post('/addattendance',protect, mongoAttendance.addAttendance); // Add a new plan
//app.get('/addattendance', protect,mongoAttendance.getAttendance); // Fetch all plans


//AUTHENTICATION
const { userRegister, userLogin, memberLogin, employeeLogin, memberRegister, employeeRegister, updatePassword, 
  deleteAccount, passwordresetrequest, deleteMemberAccount } = require('./Users/controllers/AuthController');
app.post('/api/register', userRegister); // Register Route
app.post('/api/memberregister', memberRegister); // Register Route
app.post('/api/employeeregister', employeeRegister); // Register Route
app.post('/api/updatepassword', protect, updatePassword);

app.delete('/api/:userName', protect, deleteAccount);
// app.delete('/api/members/:userName', protect1, deleteMemberAccount);
app.post('/api/passwordresetrequest', passwordresetrequest)
app.post('/api/resetpassword/:token',  updatePassword );


app.post('/api/login', userLogin); // Login Route
app.post('/api/memberlogin', memberLogin); // Login Route
app.post('/api/employeelogin', employeeLogin); // Login Route





app.post('/addevent', protect, async (req, res) => {
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
});





app.get('/events', protect, async (req, res) => {
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
});

app.delete('/events/:eventName', protect, async(req,res) => {
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
})







// POST route to handle form submission
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

app.post('/updateSettings', protect, async (req, res) => {
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
});

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
app.get('/conditional', protect, async (req, res) => {
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
});



app.get('/eventsforemployees', protect2, async (req, res) => {
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
});


app.get('/eventsformembers',protect1, async (req, res) => {
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
});

app.get('/details', protect1, async (req, res) => {
  try {
    // Query the Members collection using the email from the decoded token
    const members = await Members.find({ email: req.user.email });

    // If no members found for the email, return a not found message
    if (!members || members.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'No members found for this email' });
    }

    // Return the found members
    res.status(200).json({ status: 'SUCCESS', memberDetails: members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ status: 'ERROR', message: 'Error fetching members' });
  }
});

app.get('/details2', protect2, async (req, res) => {
  try {
    // Query the Members collection using the email from the decoded token
    const employees = await Employee.find({ email: req.user.email });

    // If no members found for the email, return a not found message
    if (!employees || employees.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'No employees found for this email' });
    }

    // Return the found members
    res.status(200).json({ status: 'SUCCESS', employeeDetails: employees });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ status: 'ERROR', message: 'Error fetching members' });
  }
});

app.get('/payments', protect1, async (req, res) => {
  try {
    // Find the member based on the email in the "members" collection
    const member = await Members.findOne({ email: req.user.email });

    if (!member) {
      return res.status(404).json({ status: 'ERROR', message: 'Member not found' });
    }

    // Find renewal details from the "renewal_email" collection

    // Construct the response JSON
    const paymentData = {
      memno: member.memno || null,
      email: member.email,
      fullname: member.fullname || null,
      memphno: member.memphno || null,
      packages:member.packages.map(package => ({
        plan: package.plan,
        price: package.price,
        doj: package.doj,
        doe: package.doe,
        paymentdate: package.paymentdate
      })),
    };

    // Send the JSON response
    res.status(200).json({
      status: 'SUCCESS',
      data: paymentData,
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'An unexpected error occurred while fetching payment details.',
    });
  }
});


// Assuming JWT middleware to verify the token and add userId to req.user
app.post('/attendance', protect1, async (req, res) => {
  const { date, in_time, out_time } = req.body;
  const userEmail = req.user?.email;

  // Check for missing email, member or employee, etc. (existing checks)
  
  const member = await Members.findOne({ email: userEmail });
  const employee = await Employee.findOne({ email: userEmail });

  // Existing code...
  
  let user_type;
  let user_id;
  let userId;

  if (member) {
    user_type = 'member';
    user_id = member.memno;
    userId = member.userId;
  } else if (employee) {
    user_type = 'employee';
    user_id = employee.emno;
    userId = employee.userId;
  }

  if (in_time && !out_time) {
    // Check-in: Ensure no active check-in
    const existingCheckIn = await Attendance.findOne({
      user_id,
      user_type,
      out_time: null,
    });

    if (existingCheckIn) {
      return res.status(400).json({
        message: 'Already checked in, cannot check in again until you check out.',
      });
    }

    const attendance = new Attendance({
      date,
      in_time,
      out_time: null,
      user_type,
      user_id,
      userId,
    });

    await attendance.save();

    return res.status(201).json({
      message: 'Checked in successfully',
      attendance,
    });
  } else if (out_time) {
    // Check-out: Ensure no active check-out
    const attendance = await Attendance.findOne({
      user_id,
      user_type,
      out_time: null,
    }).sort({ createdAt: -1 });

    if (!attendance) {
      return res.status(400).json({
        message: 'Already checked out, cannot check out again when you already check out.',
      });
    }

    attendance.out_time = out_time;
    await attendance.save();

    return res.status(200).json({
      message: 'Checked out successfully',
      attendance,
    });
  }
  
  // Handle invalid requests (already covered)
});


//Admin
//Attendance
app.get('/attendance', protect, async (req, res) => {
  try {
    // Fetch attendance records for the authenticated user, sorted by insertion time (descending)
    const attendance = await Attendance.find({ userId: req.user })
                                       .sort({ _id: -1 }) // Sort by _id in descending order
                                       .lean();

    if (attendance.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'No attendance found' });
    }

    // Enhance attendance records with fullnames from Members and Employees
    const enhancedAttendance = await Promise.all(
      attendance.map(async (record) => {
        let fullname = 'Unknown';

        // Fetch fullname from Members collection using memno
        if (record.user_type === 'member') {
          const member = await Members.findOne({ memno: record.user_id }, 'fullname');
          if (member) {
            fullname = member.fullname;
          }
        }

        // Fetch fullname from Employees collection using emno
        if (record.user_type === 'employee') {
          const employee = await Employee.findOne({ emno: record.user_id }, 'fullname');
          if (employee) {
            fullname = employee.fullname;
          }
        }

        return { ...record, fullname };
      })
    );

    // Respond with the enhanced attendance data
    res.status(200).json({ status: 'SUCCESS', attendance: enhancedAttendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ status: 'ERROR', message: 'Error fetching attendance' });
  }
});


//Member Attendance
app.get('/memberattendance', protect1, async (req, res) => {
  try {
    // Step 1: Retrieve member details using their memno from the authenticated user
    const member = await Members.findOne({ memno: req.user.memno });

    // Step 2: If the member is not found, return an error
    if (!member) {
      return res.status(404).json({ status: 'ERROR', message: 'Member not found' });
    }

    // Step 3: Fetch attendance records for the member
    const attendance = await Attendance.find({ 
      user_id: member.memno, 
      user_type: "member"   // Ensure the userId matches the member's userId
    })
    .sort({ _id: -1 })           // Sort by _id in descending order
    .select('date in_time out_time') // Only select date, in_time, and out_time fields
    .lean();

    // Step 4: If no attendance records are found, return an error
    if (attendance.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'No attendance found for this member' });
    }

    // Step 5: Enhance attendance records with member details (email, doj, doe, plan, etc.)
    const enhancedAttendance = attendance.map((record) => ({
      ...record,
    }));

    // Step 6: Respond with the enhanced attendance data
    res.status(200).json({ status: 'SUCCESS', attendance: enhancedAttendance });
  } catch (error) {
    console.error('Error fetching member attendance:', error);
    res.status(500).json({ status: 'ERROR', message: 'Error fetching member attendance' });
  }
});

app.get('/employeeattendance', protect2, async (req,res) => {

    console.log('Received emno:', req.user);  // Debugging line

  try{
    const employee = await Employee.findOne({emno: req.user.emno});

    if(!employee){
      return res.status(404).json({ status: 'ERROR', message: 'Employee not found'});  
    }

    const attendance = await Attendance.find({user_id: employee.emno,
      user_type: "employee"
    }).sort({_id: -1}).select('date in_time out_time').lean();

    if(!attendance){
      return res.status(404).json({ status: 'ERROR', message: 'Attendance not found'});  
    }

    const enhancedAttendance = attendance.map((record) => ({
      ...record
    }));

    res.status(200).json({ status: 'SUCCESS', attendance: enhancedAttendance});
  } catch (error) {
    console.error('Error fetching attendance', error);
    res.status(500).json({ status: 'ERROR', message: 'Error fetching attendance'});
  }
});



// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
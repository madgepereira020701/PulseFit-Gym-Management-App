const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./Users/db'); // Database connection

// Schema for members
const mongoPlans = require('./mongo/plans_mongo'); // Assuming plans API is in this file
const mongoMember = require('./mongo/member_mongo');
const mongoEmployee = require('./mongo/employee_mongo');
const mongoAttendance = require('./mongo/attendance_mongo');
const mongoRenewals = require('./mongo/renewals_mongo');
const mongoEvents = require('./mongo/events_mongo');
const mongoDetails = require('./mongo/details_mongo');
const mongoSettings = require('./mongo/settings_mongo');
const mongoPayments = require('./mongo/payments_mongo');
const mongoDepartment = require('./mongo/department_mongo');

const app = express();
const port = 3000;

app.use(cors({ origin: 'http://localhost:3001', credentials: true,}));
app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB
connectDB();

//MIDDLEWARES
const protect = require('./Users/middlewares/authmiddleware'); // Import the middleware
const protect1 = require('./Users/middlewares/memmiddleware'); // Import the middleware
const protect2 = require('./Users/middlewares/emmiddleware'); // Import the middleware

//MEMBERS
app.post('/members', protect, mongoMember.addMembers);
app.get('/members', protect, mongoMember.getMembers);
app.delete('/members/:memno', protect,mongoMember.deleteMember); // Delete member by memno
app.patch('/members/:email',protect, mongoMember.updateMember);
app.post('/addplans/:memno', protect, mongoMember.addMorePlans);

//RENEWALS
app.post('/renewals/:memno', protect, mongoRenewals.addRenewals);
app.get('/renewals', protect, mongoRenewals.getRenewals);

//EMPLOYEES
app.post('/employees',protect, mongoEmployee.addEmployees); // Add a new plan
app.get('/employees', protect, mongoEmployee.getEmployees);
app.delete('/employees/:emno', protect, mongoEmployee.deleteEmployee); // Delete plan by amount
app.patch('/employees/:email', protect,mongoEmployee.updateEmployee); // Update plan by amount

//PAYMENTS
app.get('/payments/:memno', protect, mongoPayments.paymentsForAdmin);
app.get('/payments', protect1, mongoPayments.memberPayments );

//ADD PLANS
app.post('/addplans',protect, mongoPlans.addPlans); // Add a new plan
app.get('/addplans', protect,mongoPlans.getPlans); // Fetch all plans
app.delete('/addplans/:planname', protect, mongoPlans.deletePlan); // Delete plan by amount
app.patch('/addplans/:planname', protect,mongoPlans.updatePlan); // Update plan by amount

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
//LOGIN
app.post('/api/login', userLogin); // Login Route
app.post('/api/memberlogin', memberLogin); // Login Route
app.post('/api/employeelogin', employeeLogin); // Login Route

//EVENTS
app.post('/addevent', protect, mongoEvents.addEvents);
app.get('/events', protect, mongoEvents.getEvents);
app.delete('/events/:eventName', protect, mongoEvents.deleteEvents);
app.get('/eventsforemployees', protect2, mongoEvents.getEmployeeEvents);
app.get('/eventsformembers',protect1, mongoEvents.getMemberEvents);

//SETTINGS
app.post('/updateSettings', protect, mongoSettings.updateSettings );
app.get('/settings', protect, mongoSettings.getsettings);

//DEPARTMENT
app.post('/departments', protect, mongoDepartment.addDepartments);
app.get('/departments', protect, mongoDepartment.getDepartments);
app.delete('/departments/:department', protect, mongoDepartment.deleteDepartment);


//DETAILS
app.get('/memberdetails', protect1, mongoDetails.memberdetails);
app.get('/employeedetails', protect2, mongoDetails.employeedetails);

//ATTENDANCE
app.post('/attendance', protect1, mongoAttendance.addAttendance);
app.get('/attendance', protect, mongoAttendance.getAttendance);
app.get('/memberattendance', protect1, mongoAttendance.getMemberAttendance);
app.get('/employeeattendance', protect2, mongoAttendance.getEmployeeAttendance);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
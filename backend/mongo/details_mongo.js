const Employee = require('../models/employees');
const Members = require('../models/members');


const memberdetails =  async (req, res) => {
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
  };
  
  const employeedetails =  async (req, res) => {
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
  };

exports.memberdetails = memberdetails;
exports.employeedetails = employeedetails;


const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://gym:workout@cluster0.ie8js.mongodb.net/Gym-Admin?retryWrites=true&w=majority&appName=Cluster0';
const Employee = require('../models/employees');

const addEmployees = async (req, res) => {
    try {
      const { fullname, emno, emphno, email, designation, department, doj } = req.body;
  
      // Ensure the userId from protect middleware is set
      const userId = req.user;
  
      if (!userId) {
        return res.status(400).json({ message: 'User ID not found in request' });
      }
  
      // Create a new employee with the userId
      const newEmployee = new Employee({
        fullname,
        emno,
        emphno,
        email,
        designation,
        department,
        doj,
        userId,
      });
  
      await newEmployee.save();
  
      res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
    } catch (error) {
      console.error('Error adding employee:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

  const getEmployees = async (req, res) => {
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
  };

  



        const deleteEmployee = async (req, res, next) => {
            const emno = parseInt(req.params.emno);
          
            const client = new MongoClient(url);
          
            try {
              await client.connect();
              const db = client.db();
              const result = await db.collection('employees').deleteOne({ emno: emno });
              client.close();
          
              if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Employee not found!' });
              }
          
              res.status(200).json({ message: 'Employee deleted successfully!' });
            } catch (error) {
              client.close();
              res.status(500).json({ message: 'Could not delete employee.', error });
            }
          };
          
          // Update a employee by emno
          const updateEmployee = async (req, res) => {
            
            try {
              const { email } = req.params; // Ensure employee number is passed in params

              const { emno, fullname, emphno,  designation, department, doj } = req.body;
          
              const userId = req.user; // Extract userId from the request (assuming it's added by the authentication middleware)
              
              if (!userId) {
                return res.status(400).json({ message: 'User ID not found in request' });
              }
          
              // Find the employee by their employee number (emno)
              const employee = await Employee.findOne({ email, userId });
          
              if (!employee) {
                return res.status(404).json({ message: 'Employee not found or unauthorized' });
              }
          
              // Update employee fields if they are provided
              if (fullname) employee.fullname = fullname;
              if (emphno) employee.emphno = emphno;
              if (emno) employee.emno = emno;
              if (designation) employee.designation = designation;
              if (department) employee.department = department;
              if (doj) employee.doj = doj;
          
              // Save the updated employee
              await employee.save();
          
              res.status(200).json({ message: 'Employee updated successfully', employee });
            } catch (error) {
              console.error('Error updating employee:', error);
              res.status(500).json({ message: 'Server error' });
            }
          };

          const getlastemno = async (req, res) => {
            try {
              const lastEmployee = await Employee.findOne({}, { emno: 1}, { sort: {emno: -1}});
              if(lastEmployee) {
                res.json({ lastEmNo: lastEmployee.emno});
              } else {
                res.json({ lastEmNo: 0});
              }
            } catch (error) {
              console.error('Error fetching emno:' , error);
              res.status(500).json({ message:'Error fetching emno' });
            }
          }
          
          


exports.addEmployees = addEmployees;
exports.getEmployees = getEmployees;
exports.deleteEmployee = deleteEmployee;
exports.updateEmployee = updateEmployee;
exports.getlastemno = getlastemno;

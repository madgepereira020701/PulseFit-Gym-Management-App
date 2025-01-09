const jwt = require('jsonwebtoken');
const User = require('../models/User.jsx');
const Member = require('../../models/members.js');
const Employee = require('../../models/employees.js');


// Define your JWT_SECRET directly
const JWT_SECRET = 'mysecretkey';  // Hardcoded secret key

// Register user
const userRegister = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ isSuccess: false, message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ isSuccess: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in userRegister:', err);
    res.status(500).json({ isSuccess: false, message: 'An error occurred. Please try again later.' });
  }
};

const memberRegister = async (req, res) => {
  const { fullname, memno, memphno, email, doj, doe, plan, price, userId, password } = req.body;

  try {
    // Check if the member already exists
    const memberExists = await Member.findOne({ email });
    if (memberExists) {
      // If the member already exists, update their password
      memberExists.password = password; // Update password with the new one
      await memberExists.save(); // Save the updated password

      return res.status(200).json({ isSuccess: true, message: 'Member password updated successfully' });
    }

    // If the member does not exist, create a new member
    const newMember = new Member({
      fullname, memno, memphno, email, doj, doe, plan, price, userId, password
    });

    await newMember.save();

    res.status(201).json({ isSuccess: true, message: 'Member registered successfully' });
  } catch (err) {
    console.error('Error in memberRegister:', err);
    res.status(500).json({ isSuccess: false, message: 'An error occurred. Please try again later.' });
  }
};


const memberLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const member = await Member.findOne({ email });
    if (!member) {
      return res.status(400).json({ msg: 'Member not found' });
    }

    // Check if password is correct (assuming passwords are stored in plain text)
    // If passwords are hashed (recommended), use bcrypt.compare instead
    const isValidPassword = await member.isValidPassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ isSuccess: false, message: 'Invalid credentials' });
    }

    // Generate JWT token for the member
    const token = jwt.sign(
      { memberId: member._id, email: member.email, role: member.role }, // Payload
      JWT_SECRET, // Your JWT secret key
      { expiresIn: '1h' } // Token expiration time (1 hour)
    );

    res.json({
      isSuccess: true,
      message: 'Logged in successfully',
      data: {
        memberDetails: member,
        token, // Send token back in the response
      },
    });
  } catch (err) {
    console.error('Error in memberLogin:', err);
    res.status(500).json({ isSuccess: false, message: 'An error occurred. Please try again later.' });
  }
};


const employeeRegister = async (req, res) => {
  const { fullname, emno, emphno, email, doj, department,  userId, password } = req.body;

  try {
    // Check if the employee already exists
    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      // If the employee already exists, update their password
      employeeExists.password = password; // Update password with the new one
      await employeeExists.save(); // Save the updated password

      return res.status(200).json({ isSuccess: true, message: 'Employee password updated successfully' });
    }

    // If the employee does not exist, create a new employee
    const newEmployee = new Employee({
      fullname, emno, emphno, email, doj,  department, role, userId, password
    });

    await newEmployee.save();

    res.status(201).json({ isSuccess: true, message: 'Employee registered successfully' });
  } catch (err) {
    console.error('Error in employeeRegister:', err);
    res.status(500).json({ isSuccess: false, message: 'An error occurred. Please try again later.' });
  }
};


const employeeLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ msg: 'Employee not found' });
    }

    // Check if password is correct (assuming passwords are stored in plain text)
    // If passwords are hashed (recommended), use bcrypt.compare instead
    const isValidPassword = await employee.isValidPassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ isSuccess: false, message: 'Invalid credentials' });
    }

    // Generate JWT token for the employee
    const token = jwt.sign(
      { employeeId: employee._id, email: employee.email, role: employee.role }, // Payload
      JWT_SECRET, // Your JWT secret key
      { expiresIn: '1h' } // Token expiration time (1 hour)
    );

    res.json({
      isSuccess: true,
      message: 'Logged in successfully',
      data: {
        employeeDetails: employee,
        token, // Send token back in the response
      },
    });
  } catch (err) {
    console.error('Error in employeeLogin:', err);
    res.status(500).json({ isSuccess: false, message: 'An error occurred. Please try again later.' });
  }
};





// Login user
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ isSuccess: false, message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ isSuccess: false, message: 'Invalid credentials' });
    }

    // Create JWT token using hardcoded secret key
    const token = jwt.sign(
      { userId: user._id, userName: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ isSuccess: true, data: { userName: user.name, token } });
  } catch (err) {
    console.error('Error in userLogin:', err);
    res.status(500).json({ isSuccess: false, message: 'An error occurred. Please try again later.' });
  }
};



module.exports = { userRegister, userLogin, memberLogin, employeeLogin, memberRegister, employeeRegister };

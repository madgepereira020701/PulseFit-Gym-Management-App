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



const memberLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const member = await Member.findOne({ email });
    if (!member) {
      return res.status(400).json({ msg: 'Member not found' });
    }

    // Check if password is correct (assuming you store password hashes)
    // If passwords are hashed (recommended), use bcrypt.compare instead
    if (member.password && !await bcrypt.compare(password, member.password)) {
      return res.status(400).json({ msg: 'Invalid password' });
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
        token // Send token back in the response
      } 
    });
  } catch (err) {
    console.error('Error in memberLogin:', err);
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

    // Check if password is correct (assuming you store password hashes)
    // If passwords are hashed (recommended), use bcrypt.compare instead
    if (employee.password && !await bcrypt.compare(password, employee.password)) {
      return res.status(400).json({ msg: 'Invalid password' });
    }

    // Generate JWT token for the member
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
        token // Send token back in the response
      } 
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



module.exports = { userRegister, userLogin, memberLogin, employeeLogin };

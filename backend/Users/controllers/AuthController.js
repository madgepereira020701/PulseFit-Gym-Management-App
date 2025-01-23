const jwt = require('jsonwebtoken');
const User = require('../models/User.jsx');
const Member = require('../../models/members.js');
const Employee = require('../../models/employees.js');
const bcrypt = require('bcryptjs');
const { isDate } = require('moment');


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

const memupdatePassword = async(req,res) => {
  const { newpassword, confirmpassword} = req.body;
  const email = req.user.email;

  if(!newpassword || !confirmpassword)
  {
    res.status(400).json({ isSuccess: false, message: 'Both fields are required' });
  }
  if(newpassword !== confirmpassword)
    {
      res.status(400).json({ isSuccess: false, message: 'Passwords do not match' });
    }

    try {
    const user = await Member.findOne({email});
    if(!user) {
      res.status(404).json({ isSuccess: false, message: 'User is not in email' });
    }

    const isMatch = await bcrypt.compare(newpassword.trim(), user.password);
    if(isMatch){
      res.status(400).json({ isSuccess: false, message: 'New password cannot be same as the old one' });
    }

    user.password = newpassword.trim();
    await user.save();

    console.log('Updated Password:', user.password);
    res.status(200).json({ isSuccess: true, message: 'Password updated successfully' });
  } catch(err){
    console.error('Error in memupdatePassword:', err);
    res.status(500).json({ isSuccess: true, message: 'An error occured' });

  }

}



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

  console.log('Entered password:', password);


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


const emupdatePassword = async (req,res) => {
  const { newpassword, confirmpassword } = req.body;
  const email = req.user.email;

  console.log('Recieved new password:', newpassword);


  if(!newpassword || !confirmpassword){
    return res.status(400).json({isSuccess: false, message: 'Both the fields are required'});
  }
  if(newpassword !== confirmpassword){
    return res.status(400).json({isSuccess: false, message: 'Passwords do not match'});
  }

  try{
  const user = await Employee.findOne({email});
  if(!user){
    return res.status(404).json({isSuccess: false, message: 'User not found in email'});
  }

  console.log('Current hashed password:', user.password);

  const isMatch = await bcrypt.compare(newpassword.trim(), user.password);
  if(isMatch){
    return res.status(400).json({isSuccess: false, message: 'New password cannot be same as the old one'});
  }

  user.password = newpassword.trim();
  await user.save();

  console.log('Updated password:', user.password);
  return res.status(200).json({ isSuccess: true , message: 'Passwords are updated'});
  } catch(err) {
    console.log('Error in emupdatePassword', err);
    return res.status(500).json({ isSuccess: false , message: 'An error occured'});
  }  
}



// Login user
const userLogin = async(req,res) => {
  const { email, password } = req.body;

  console.log('Entered email:', email);
  console.log('Entered password:', password);


  try{
    const admin = await User.findOne({email});
    if(!admin){
      console.log("User not found in email");
      return res.status(400).json({isSuccess: false, message: 'Invalid credentials'});
    }

    console.log('Stored hashed password:', admin.password);

    const isValidPassword = await admin.isValidPassword(password);
    if(!isValidPassword){
      return res.status(400).json({isSuccess: false, message: 'Invalid credentials'});
    }
      console.log('Entered password:', password);

      const token = jwt.sign({ userId: admin._id, userName: admin.name}, JWT_SECRET, {expiresIn: '1hr'});
      return res.status(200).json({isSuccess: true, data: { userName: admin.name, token}});
  } catch (err)
  {
    console.log("Error in userLogin", err);
    return res.status(500).json({isSuccess: false, message: 'Message occured'});
  }
}

const updatePassword = async(req,res) => {
  const { newpassword, confirmpassword} = req.body;
  const userId = req.user;

  console.log('Recieved new password:', newpassword);
  console.log('Authenticated user ID:', userId);

  if(!newpassword || !confirmpassword){
    return res.status(400).json({ isSuccess: false , message: 'Both fields are required'});
  }

  if(newpassword !== confirmpassword){
    return res.status(404).json({ isSuccess: false , message: 'Passwords do not match'});
  }

  try{
  const user = await User.findById(userId);
  if(!user){
    return res.status(404).json({ isSuccess: false , message: 'User not found'});
  }

  console.log('Current hashed password:', user.password);
  
  const isMatch = await bcrypt.compare(newpassword.trim(), user.password);
  if(isMatch){
    return res.status(400).json({ isSuccess: false , message: 'New password cannot be same as the old one '});
  }

  user.password = newpassword.trim();
  await user.save();

  console.log('Updated password:', user.password);
  return res.status(200).json({ isSuccess: true , message: 'Passwords are updated'});
} catch (err){
  console.error('Error in updatePassword', err);
  return res.status(500).json({ isSuccess: false , message: 'An error occured'});
}  
};

const deleteAccount = async(req,res) => {
  userName = req.params.userName;

  try{
    const result = await User.deleteOne({name: userName});
    
    if(result.deletedCount === 0)
    {
      return res.status(404).json({message: 'Account is not found.'});
    }
    return res.status(200).json({message: 'Account deleted successfully.'});
  } catch (error)
  {
    return res.status(500).json({message: 'Could not delete account.',error});
  }
}


module.exports = { userRegister, userLogin, memberLogin, employeeLogin, memberRegister, employeeRegister, updatePassword, emupdatePassword, memupdatePassword,
  deleteAccount
 };

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.jsx');
const Member = require('../../models/members.js');
const Employee = require('../../models/employees.js');
const bcrypt = require('bcryptjs')


// Define your JWT_SECRET directly
const JWT_SECRET = ''; //yoursecretkey (any name) Hardcoded secret key

// Register admin
const adminRegister = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ isSuccess: false, message: 'Admin already exists' });
    }

    // Create new admin
    const newAdmin = new Admin({ name, email, password });
    await newAdmin.save();

    res.status(201).json({ isSuccess: true, message: 'Admin registered successfully' });
  } catch (err) {
    console.error('Error in adminRegister:', err);
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
      { memberId: member._id, email: member.email, userName: member.fullname, role: member.role, memno: member.memno }, // Payload
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
      { employeeId: employee._id, email: employee.email, role: employee.role, emno: employee.emno }, // Payload
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






// Login admin
const adminLogin = async(req,res) => {
  const { email, password } = req.body;

  console.log('Entered email:', email);
  console.log('Entered password:', password);


  try{
    const admin = await Admin.findOne({email});
    if(!admin){
      console.log("Admin not found in email");
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
  const { token } = req.params;
  const { newpassword, confirmpassword} = req.body;

  console.log('Recieved new password:', newpassword);

  if(!newpassword || !confirmpassword){
    return res.status(400).json({ isSuccess: false , message: 'Both fields are required'});
  }

  if(newpassword !== confirmpassword){
    return res.status(404).json({ isSuccess: false , message: 'Passwords do not match'});
  }

  try{
    console.log('Token:', token)
    const models = [Admin, Member, Employee]
    let foundDoc = null;
    for (const model of models){
  const doc = await model.findOne({passwordResetToken: token,
    passwordResetExpires: {$gt: Date.now()}}
  );
  if(doc){
    foundDoc = doc;
    break;
  } 
}


if(!foundDoc)
{
  return res.status(404).json({isSuccess: false, message: 'Admin/Member/Employee not found or token expired.'});
}
          console.log("Found Document:", foundDoc); // Log the result of findOne
  
  const isMatch = await bcrypt.compare(newpassword.trim(), foundDoc.password);
  if(isMatch){
    console.log("Passwords cannot be similar to old one")
    return res.status(400).json({ isSuccess: false , message: 'New password cannot be same as the old one '});
  }

  foundDoc.password = newpassword.trim();
  foundDoc.passwordResetToken = undefined;
  foundDoc.passwordResetExpires = undefined;
  await foundDoc.save();

  console.log('Updated password:', foundDoc.password);
  return res.status(200).json({ isSuccess: true , message: 'Passwords are updated'});
} catch (err){
  console.error('Error in updatePassword', err);
  return res.status(500).json({ isSuccess: false , message: 'An error occured'});
}  
};



function generatePasswordResetToken() {
  const token = jwt.sign({purpose: 'passwordReset'}, JWT_SECRET, { expiresIn: '1hr'});
  return token;
}

async function storeToken(model,email,token) {
  console.log(`storeToken for ${model.modelName} call with email:`, email);

  try{
    const entity = await model.findOne({email: email});
    
    if(!entity) {
      console.log(`${model.modelName} not found for email:`, email);
      throw new Error(`${model.modelName} not found`);
    }
    console.log(`${model.modelName} Found:`, entity);
    
    entity.passwordResetToken = token;
    entity.passwordResetExpires = Date.now() + 3600000;
    await entity.save();

    console.log(`Token stored for ${model.modelName} ${token}`);
  } catch (error) {
    console.log("Error storing token:", error);
    throw error;
  }
}


const passwordresetrequest = async(req,res) => {
  const { email } = req.body;

  try{
      const models = [Admin, Member, Employee]
      let foundModel = null;
      for (const model of models){
    const entity = await model.findOne({email}
    );
    if(entity){
      foundModel = model;
      break;
    } 
  }

  if(!foundModel)
    {
      return res.status(404).json({isSuccess: false, message: 'Email not found.'});
    }
    

    const token = generatePasswordResetToken();

       try {
        await sendPasswordResetEmail(foundModel,email,token);
      return res.status(200).json({message: 'Password reset email sent'});
       } catch(emailError){
        console.error('Error sending password reset email:', emailError);
        res.status(500).json({message: 'An error occurred'});    
       }
    }
  catch(err){
    console.error('Error in passwordresetrequest:', err);
    res.status(500).json({message: 'An error occurred'});
  }
}

const nodemailer = require('nodemailer');
async function sendPasswordResetEmail(model,email,token) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: 'madgepereira020701@gmail.com',
    pass: 'xezg tgdr tods jpbc', // Use an app-specific password for Gmail
    }
  });


  const resetLink = `http://localhost:3001/changepassword?token=${token}`
  console.log("Reset Link:", resetLink); // Log the reset link for verification


  const mailOptions = {
    from: 'madgepereira020701@gmail.com',
    to: email,
    subject: 'Password Reset for Your Account',
    html:`
    <p>Click on the link below to reset your password</p>
    <a href="${resetLink}">Reset Password</a>`,
  };

  await transporter.sendMail(mailOptions);
  await storeToken(model,email,token);
}

module.exports = { adminRegister, adminLogin, memberLogin, employeeLogin, memberRegister, employeeRegister, updatePassword, 
  passwordresetrequest
 };

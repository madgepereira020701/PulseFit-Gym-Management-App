
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MongoDB URL
const url = 'mongodb+srv://gym:workout@cluster0.ie8js.mongodb.net/Gym-Admin?retryWrites=true&w=majority&appName=Cluster0';  // Use environment variables

// Add a new admin (register)
const addadmin = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db();
    const existingAdmin = await db.collection('admin').findOne({ email });

    if (existingAdmin) {
      client.close();
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newAdmin = { name, email, password: hashedPassword };
    const result = await db.collection('admin').insertOne(newAdmin);
    client.close();
    res.status(201).json({ message: 'Admin registered successfully', result });
  } catch (error) {
    res.status(500).json({ message: 'Could not store admin data.', error });
  }
};

// Admin login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password' });
  }

  try {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db();
    const admin = await db.collection('admin').findOne({ email });

    if (!admin) {
      client.close();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      client.close();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ adminId: admin._id, email: admin.email }, 'mongodb+srv://gym:workout@cluster0.ie8js.mongodb.net/Gym-Admin?retryWrites=true&w=majority&appName=Cluster0', { expiresIn: '1h' });
    client.close();
    res.status(200).json({ message: 'Login successful', token, admin: { id: admin._id, name: admin.name } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in admin.', error });
  }
};

// Export functions
module.exports = { addadmin, loginAdmin };















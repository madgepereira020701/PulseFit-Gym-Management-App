const mongoose = require('mongoose');
const Plans = require('../models/addplan'); // Model for the Plans collection

// Connect to MongoDB
mongoose.connect(
  'mongodb+srv://gym:workout@cluster0.ie8js.mongodb.net/Gym-Admin?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => console.log('Connected to the database!'))
  .catch((error) => console.error('Database connection failed:', error));

// Add a new plan
const addPlans = async (req, res, next) => {
  const newPlan = new Plans(req.body);

  try {
    const result = await newPlan.save();
    res.status(201).json(result); // Return the created plan
  } catch (error) {
    res.status(500).json({ message: 'Adding plan failed!', error });
  }
};

// Get all plans
const getPlans = async (req, res, next) => {
  try {
    const plans = await Plans.find({ userId: req.user }); // Fetch all plans
    res.json(plans); // Return the plans as a JSON response
  } catch (error) {
    res.status(500).json({ message: 'Fetching plans failed!', error });
  }
};

// Delete a plan by amount
const deletePlan = async (req, res, next) => {
  const amount = req.params.amount;

  try {
    const result = await Plans.deleteOne({ amount: amount });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Plan not found!' });
    }

    res.status(200).json({ message: 'Plan deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete member.', error });
  }
};

// Update a member by memno
const updatePlan = async (req, res, next) => {
  const amount = req.params.amount;
  const updates = req.body;

  try {
    const result = await Plans.updateOne({ amount: amount }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Plan not found!' });
    }

    res.status(200).json({ message: 'Plan updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Could not update member.', error });
  }
};

// Export functions
exports.addPlans = addPlans;
exports.getPlans = getPlans;
exports.deletePlan = deletePlan;
exports.updatePlan = updatePlan;
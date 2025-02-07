const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://gym:workout@cluster0.ie8js.mongodb.net/Gym-Admin?retryWrites=true&w=majority&appName=Cluster0';

// Add a new plan
const addPlans = async (req, res) => {
  const newPlan = {
    planname: req.body.planname,
    validity: req.body.validity,
    amount: req.body.amount,
    userId: req.user, // From authentication middleware
  };

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db();
    const result = await db.collection('plans').insertOne(newPlan);
    client.close();
    res.status(201).json(result); // Plan successfully added
  } catch (error) {
    client.close();
    res.status(500).json({ message: 'Could not store plan data.', error });
  }
};

// Fetch all plans
const getPlans = async (req, res) => {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db();
    const plans = await db.collection('plans').find({ userId: req.user }).toArray(); // Fetch all plans for the user
    client.close();
    res.json(plans); // Return the list of plans
  } catch (error) {
    client.close();
    res.status(500).json({ message: 'Could not retrieve plans.', error });
  }
};

// Delete a plan by amount
const deletePlan = async (req, res) => {
  const planname = req.params.planname;

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db();
    const result = await db.collection('plans').deleteOne({ planname: planname, userId: req.user });
    client.close();

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Plan not found!' });
    }

    res.status(200).json({ message: 'Plan deleted successfully!' });
  } catch (error) {
    client.close();
    res.status(500).json({ message: 'Could not delete plan.', error });
  }
};

// Update a plan by amount
const updatePlan = async (req, res) => {
  const  planname = req.params.planname;
  const { validity, amount} = req.body;

  const updates = {}
  updates.validity = validity;
  updates.amount = amount;

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db();
    const result = await db.collection('plans').updateOne(
      { planname: planname, userId: req.user },
      { $set: updates }
    );
    client.close();

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Plan not found!' });
    }

    res.status(200).json({ message: 'Plan updated successfully!' });
  } catch (error) {
    client.close();
    res.status(500).json({ message: 'Could not update plan.', error });
  }
};

// Export functions
module.exports = {
  addPlans,
  getPlans,
  deletePlan,
  updatePlan,
};

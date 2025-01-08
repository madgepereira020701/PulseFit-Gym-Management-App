const mongoose = require('mongoose');
const Members = require('./models/members');

// Connect to MongoDB
mongoose.connect(
  'mongodb+srv://gym:workout@cluster0.ie8js.mongodb.net/Gym-Admin?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => console.log('Connected to the database!'))
  .catch((error) => console.error('Database connection failed:', error));

// Add a new member
// const addMembers = async (req, res, next) => {
//   const newMember = new Members(req.body);

//   try {
//     const result = await newMember.save();
//     res.status(201).json(result);
//   } catch (error) {
//     res.status(500).json({ message: 'Adding member failed!', error });
//   }
// };

// Fetch all members
// const getMembers = async (req, res, next) => {
//   try {
//     const members = await Members.find();
//     res.json(members);
//   } catch (error) {
//     res.status(500).json({ message: 'Fetching members failed!', error });
//   }
// };

// Delete a member by memno
const deleteMember = async (req, res, next) => {
  const memno = req.params.memno;

  try {
    const result = await Members.deleteOne({ memno: memno });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Member not found!' });
    }

    res.status(200).json({ message: 'Member deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete member.', error });
  }
};

// Update a member by memno
const updateMember = async (req, res, next) => {
  const memno = req.params.memno;
  const { memphno, doj, doe } = req.body; // Destructure the fields you want to update

  // Create an updates object with only allowed fields
  const updates = {};
  if (memphno) updates.memphno = memphno;
  if (doj) updates.doj = doj;
  if (doe) updates.doe = doe;


  try {
    const result = await Members.updateOne({ memno: memno }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Member not found!' });
    }

    res.status(200).json({ message: 'Member updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Could not update member.', error });
  }
};

// Export functions
//exports.addMembers = addMembers;
//exports.getMembers = getMembers;
exports.deleteMember = deleteMember;
exports.updateMember = updateMember;

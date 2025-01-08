const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://gym:workout@cluster0.ie8js.mongodb.net/Gym-Admin?retryWrites=true&w=majority&appName=Cluster0';

// Add a new member
// const addMembers = async (req, res, next) => {
//   const newMember = {
//     fullname: req.body.fullname,
//     memno: req.body.memno,
//     memphno: req.body.memphno,
//     email: req.body.email,
//     doj: req.body.doj,
//     doe: req.body.doe,
//     plan: req.body.plan,
//     price: req.body.price,
//   };

//   const client = new MongoClient(url);

//   try {
//     await client.connect();
//     const db = client.db();
//     const result = await db.collection('members').insertOne(newMember);
//     client.close();
//     res.status(201).json(result);
//   } catch (error) {
//     client.close();
//     res.status(500).json({ message: 'Could not store data.', error });
//   }
// };

// Fetch all members
// const getMembers = async (req, res, next) => {
//   const client = new MongoClient(url);

//   try {
//     await client.connect();
//     const db = client.db();
//     const members = await db.collection('members').find().toArray();
//     client.close();
//     res.json(members);
//   } catch (error) {
//     client.close();
//     res.status(500).json({ message: 'Could not retrieve members.', error });
//   }
// };

// Delete a member by memno
const deleteMember = async (req, res, next) => {
  const memno = parseInt(req.params.memno);

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db();
    const result = await db.collection('members').deleteOne({ memno: memno });
    client.close();

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Member not found!' });
    }

    res.status(200).json({ message: 'Member deleted successfully!' });
  } catch (error) {
    client.close();
    res.status(500).json({ message: 'Could not delete member.', error });
  }
};

// Update a member by memno
const updateMember = async (req, res, next) => {
  const memno = parseInt(req.params.memno);
  const { memphno, doj, doe } = req.body; // Destructure the fields you want to update

  // Create an updates object with only allowed fields
  const updates = {};
  if (memphno) updates.memphno = memphno;
  if (doj) updates.doj = doj;
  if (doe) updates.doe = doe;

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db();
    const result = await db.collection('members').updateOne(
      { memno: memno },
      { $set: updates }
    );
    client.close();

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Member not found!' });
    }

    res.status(200).json({ message: 'Member updated successfully!' });
  } catch (error) {
    client.close();
    res.status(500).json({ message: 'Could not update member.', error });
  }
};



// Export functions
//exports.addMembers = addMembers;
//exports.getMembers = getMembers;
exports.deleteMember = deleteMember;
exports.updateMember = updateMember;

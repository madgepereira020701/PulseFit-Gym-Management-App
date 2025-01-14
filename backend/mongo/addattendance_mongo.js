const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://gym:workout@cluster0.ie8js.mongodb.net/Gym-Admin?retryWrites=true&w=majority&appName=Cluster0';


const addAttendance = async(req, res) => {
    const newAttendance = {
        in_time: req.body.in_time,
        memno: req.body.memno,
        userId: req.user,
    };
 
    const client = new MongoClient(url);

    try{
        await client.connect();
        const db = client.db();
        const result = await db.collection('attendances').insertOne(newAttendance);
        client.close();
        res.status(201).json(result);
    } catch (error) {
        client.close();
        res.status(500).json({ message: 'Could not store attendance data.', error })
    }
};

const getAttendance = async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db();
        const attendance = await db.collection('attendances').find({ userId: req.user }).toArray(); // Fetch all plans for the user
        client.close();
        res.json(attendance); // Return the list of plans
      } catch (error) {
        client.close();
        res.status(500).json({ message: 'Could not retrieve attendance.', error });
      }
    
};

module.exports = {
    addAttendance,
    getAttendance
}
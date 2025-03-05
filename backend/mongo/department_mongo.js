
const MongoClient = require('mongodb').MongoClient;
// for the below url, paste the mongodb uri link 
const url = //mongodb uri link;


const addDepartments = async(req,res) => {
    const newDepartment = {
        department: req.body.department,
        userId: req.user
    };

    const client = new MongoClient(url);

    try{
       await client.connect();
       const db = client.db();
       const result = await db.collection('departments').insertOne(newDepartment);
       client.close();
       res.status(201).json(result);
    } catch (error) {
        client.close();
        res.status(500).json({ message: 'Could not store plan data.', error });
    }
};

const getDepartments = async(req,res) => {
    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db();
        const departments = await db.collection('departments').find({userId: req.user}).toArray();
        client.close();
        res.json(departments);
    } catch (error) {
        client.close();
        res.status(500).json({ message: 'Could not retrieve departments.', error });
    }
};

const deleteDepartment = async(req, res) => {
    const department = req.params.department;
    const client = new MongoClient(url);
    
    try {
      await client.connect();
      const db = client.db();
      const result = await db.collection('departments').deleteOne({ department: department, userId: req.user});
      client.close();

      if(result.deletedCount === 0) {
        return res.status(404).json({messge: 'Department not found.'});
      }

      res.status(200).json({ message: 'Department deleted successfully.'});
    } catch (error) {
        client.close();
      res.status(500).json({ message: 'Could not delete plan.', error });
    }
};

module.exports = { addDepartments, getDepartments, deleteDepartment };


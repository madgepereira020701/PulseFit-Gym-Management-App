const MongoClient = require('mongodb').MongoClient;
// for the below url, paste the mongodb uri link 
const url = //mongodb uri link;
const Members = require('../models/members');
const Attendance = require('../models/attendance');
const Employee = require('../models/employees');

 const addAttendance =  async (req, res) => {
    const { date, in_time, out_time } = req.body;
    const userEmail = req.user?.email;
  
    // Check for missing email, member or employee, etc. (existing checks)
    
    const member = await Members.findOne({ email: userEmail });
    const employee = await Employee.findOne({ email: userEmail });
  
    // Existing code...
    
    let user_type;
    let user_id;
    let userId;
  
    if (member) {
      user_type = 'member';
      user_id = member.memno;
      userId = member.userId;
    } else if (employee) {
      user_type = 'employee';
      user_id = employee.emno;
      userId = employee.userId;
    }
  
    if (in_time && !out_time) {
      // Check-in: Ensure no active check-in
      const existingCheckIn = await Attendance.findOne({
        user_id,
        user_type,
        out_time: null,
      });
  
      if (existingCheckIn) {
        return res.status(400).json({
          message: 'Already checked in, cannot check in again until you check out.',
        });
      }
  
      const attendance = new Attendance({
        date,
        in_time,
        out_time: null,
        user_type,
        user_id,
        userId,
      });
  
      await attendance.save();
  
      return res.status(201).json({
        message: 'Checked in successfully',
        attendance,
      });
    } else if (out_time) {
      // Check-out: Ensure no active check-out
      const attendance = await Attendance.findOne({
        user_id,
        user_type,
        out_time: null,
      }).sort({ createdAt: -1 });
  
      if (!attendance) {
        return res.status(400).json({
          message: 'Already checked out, cannot check out again when you already check out.',
        });
      }
  
      attendance.out_time = out_time;
      await attendance.save();
  
      return res.status(200).json({
        message: 'Checked out successfully',
        attendance,
      });
    }
    
    // Handle invalid requests (already covered)
  };
  
  
  //Admin
  //Attendance
  const getAttendance =  async (req, res) => {
    try {
      // Fetch attendance records for the authenticated user, sorted by insertion time (descending)
      const attendance = await Attendance.find({ userId: req.user })
                                         .sort({ _id: -1 }) // Sort by _id in descending order
                                         .lean();
  
       if(!attendance){
        return res.status(404).json({ status: 'ERROR', message: 'Attendance not found'});  
      }
  
      // Enhance attendance records with fullnames from Members and Employees
      const enhancedAttendance = await Promise.all(
        attendance.map(async (record) => {
          let fullname = 'Unknown';
  
          // Fetch fullname from Members collection using memno
          if (record.user_type === 'member') {
            const member = await Members.findOne({ memno: record.user_id }, 'fullname');
            if (member) {
              fullname = member.fullname;
            }
          }
  
          // Fetch fullname from Employees collection using emno
          if (record.user_type === 'employee') {
            const employee = await Employee.findOne({ emno: record.user_id }, 'fullname');
            if (employee) {
              fullname = employee.fullname;
            }
          }
  
          return { ...record, fullname };
        })
      );
  
      // Respond with the enhanced attendance data
      res.status(200).json({ status: 'SUCCESS', attendance: enhancedAttendance });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ status: 'ERROR', message: 'Error fetching attendance' });
    }
  };
  
  
  //Member Attendance
  const getMemberAttendance =  async (req, res) => {
    try {
      // Step 1: Retrieve member details using their memno from the authenticated user
      const member = await Members.findOne({ memno: req.user.memno });
  
      // Step 2: If the member is not found, return an error
      if (!member) {
        return res.status(404).json({ status: 'ERROR', message: 'Member not found' });
      }
  
      // Step 3: Fetch attendance records for the member
      const attendance = await Attendance.find({ 
        user_id: member.memno, 
        user_type: "member"   // Ensure the userId matches the member's userId
      })
      .sort({ _id: -1 })           // Sort by _id in descending order
      .select('date in_time out_time') // Only select date, in_time, and out_time fields
      .lean();
  
      // Step 4: If no attendance records are found, return an error
      if(!attendance){
        return res.status(404).json({ status: 'ERROR', message: 'Attendance not found'});  
      }
  
      // Step 5: Enhance attendance records with member details (email, doj, doe, plan, etc.)
      const enhancedAttendance = attendance.map((record) => ({
        ...record,
      }));
  
      // Step 6: Respond with the enhanced attendance data
      res.status(200).json({ status: 'SUCCESS', attendance: enhancedAttendance });
    } catch (error) {
      console.error('Error fetching member attendance:', error);
      res.status(500).json({ status: 'ERROR', message: 'Error fetching member attendance' });
    }
  };
  
 const getEmployeeAttendance =  async (req,res) => {
  
      console.log('Received emno:', req.user);  // Debugging line
  
    try{
      const employee = await Employee.findOne({emno: req.user.emno});
  
      if(!employee){
        return res.status(404).json({ status: 'ERROR', message: 'Employee not found'});  
      }
  
      const attendance = await Attendance.find({user_id: employee.emno,
        user_type: "employee"
      }).sort({_id: -1}).select('date in_time out_time').lean();
  
      if(!attendance){
        return res.status(404).json({ status: 'ERROR', message: 'Attendance not found'});  
      }
  
      const enhancedAttendance = attendance.map((record) => ({
        ...record
      }));
  
      res.status(200).json({ status: 'SUCCESS', attendance: enhancedAttendance});
    } catch (error) {
      console.error('Error fetching attendance', error);
      res.status(500).json({ status: 'ERROR', message: 'Error fetching attendance'});
    }
  };

module.exports = { addAttendance, getAttendance, getMemberAttendance, getEmployeeAttendance }

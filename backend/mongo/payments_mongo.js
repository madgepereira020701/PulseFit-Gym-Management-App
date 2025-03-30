const Members = require('../models/members');

const paymentsForAdmin = async (req, res) => {
    const { memno } = req.params;
  
    try {
      // Find the member based on memno in the "members" collection
      const member = await Members.findOne({ memno });
  
      if (!member) {
        return res.status(404).json({ status: 'ERROR', message: 'Member not found' });
      }
  
      // Find renewal details from the "renewal_email" collection
      
  
      // Construct the response JSON
      const paymentData = {
        memno: member.memno,
        email: member.email,
        fullname: member.fullname,
        memphno: member.memphno,
        packages:member.packages.map(package => ({
          plan: package.plan,
          price: package.price,
          doj: package.doj,
          doe: package.doe,
          paymentdate: package.paymentdate
        })) , // Handle cases where member.packages is undefined or not an array
    // Handle cases where renewals is undefined or not an array
        userId: req.user
      };
  
      // Send the JSON response
      res.status(200).json({
        status: 'SUCCESS',
        data: paymentData,
      });
    } catch (error) {
      console.error('Error fetching payment details:', error);
      res.status(500).json({ status: 'ERROR', message: 'Error fetching payment details' });
    }
  };
  
const memberPayments = async (req, res) => {
    try {
      // Find the member based on the email in the "members" collection
      const member = await Members.findOne({ email: req.user.email });
  
      if (!member) {
        return res.status(404).json({ status: 'ERROR', message: 'Member not found' });
      }
  
      // Find renewal details from the "renewal_email" collection
  
      // Construct the response JSON
      const paymentData = {
        memno: member.memno || null,
        email: member.email,
        fullname: member.fullname || null,
        memphno: member.memphno || null,
        packages:member.packages.map(package => ({
          plan: package.plan,
          price: package.price,
          doj: package.doj,
          doe: package.doe,
          paymentdate: package.paymentdate
        })),
      };
  
      // Send the JSON response
      res.status(200).json({
        status: 'SUCCESS',
        data: paymentData,
      });
    } catch (error) {
      console.error('Error fetching payment details:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'An unexpected error occurred while fetching payment details.',
      });
    }
  };


exports.memberPayments = memberPayments;
exports.paymentsForAdmin = paymentsForAdmin;


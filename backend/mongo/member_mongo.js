const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://gym:workout@cluster0.ie8js.mongodb.net/Gym-Admin?retryWrites=true&w=majority&appName=Cluster0';
const Members = require('../models/members');
const axios = require('axios'); // Make sure to install axios
const moment = require('moment');
const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'madgepereira020701@gmail.com',
    pass: 'xezg tgdr tods jpbc', // Use an app-specific password for Gmail
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('Error configuring email transporter:', error);
  } else {
    console.log('Ready to send emails.');
  }
});

// Utility function to send email
const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: 'madgepereira020701@gmail.com',
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
const addMembers = async (req, res) => {
  console.log('Packages recieved:', req.body.packages);
  const { memno, email, memphno, fullname, packages} = req.body;
  const userId = req.user;

  // Get token from Authorization header
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
      return res.status(400).json({ status: 'ERROR', message: 'Token not provided' });
  }

  // Fetch available plans for the logged-in user
  try {
    

      const response = await axios.get('http://localhost:3000/addplans', {
          headers: { Authorization: `Bearer ${token}` }
      });
      const availablePlans = response.data.filter(plan => plan.userId === userId);
      const savedPackages = [];
      let paymentdate = moment().format('YYYY-MM-DD');
      
      for(const packageItem of packages){
        const { plan, price, doj,doe } = packageItem;
      

      const selectedPlan = availablePlans.find(
        (p) =>
          p.planname &&
          plan &&
          p.planname.trim().toLowerCase() === plan.trim().toLowerCase()
      );
      if (!selectedPlan) {
          console.log('No matching plan found.');
          return res.status(400).json({ status: 'ERROR', message: 'Invalid plan selected for this user' });
      }


       // Calculate end date (doe) based on the plan's validity
  let calculatedDoe;
  try {
      const startDate = moment(doj, 'YYYY-MM-DD');
      calculatedDoe = startDate.add(selectedPlan.validity, 'months').format('YYYY-MM-DD');
  } catch (error) {
      console.error('Error calculating end date:', error);
      return res.status(500).json({ status: 'ERROR', message: 'Error calculating end date' });
  }
  const newPackage = {
    plan: selectedPlan.planname,
    price: parseFloat(price),
    doj: doj,
    doe: calculatedDoe,
    paymentdate: paymentdate
  };
   savedPackages.push(newPackage);
  } 

  // Check if the plan exists in the available plans


  // Prepare and send email content
  let emailContent = `
      <h3>Hello ${fullname},</h3>
      <p>Member ID: ${memno}</p>
      <p>Member Phone Number: ${memphno}</p>
      <p>Your subscription details are as follows:</p>
      <table border="1" style="border-collapse: collapse; width: 100%; text-align: left;">
          <thead>
              <tr>
                  <th>Plan</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Price</th>
              </tr>
          </thead>
          <tbody>`;

          savedPackages.forEach(pkg => {
            emailContent +=`
              <tr>
                  <td>${pkg.plan}</td>
                  <td>${pkg.doj}</td>
                  <td>${pkg.doe}</td>
                  <td>${pkg.price}</td>
              </tr>`;
          });

          emailContent += `
          </tbody>
      </table>
  `;
  const emailSent = await sendEmail(email, 'Congratulations on Your Membership', emailContent);

  if (!emailSent) {
      console.error('Error sending email');
      return res.status(500).json({ status: 'ERROR', message: 'Error sending email' });
  }

  // Save the new member details
  
      const newMember = new Members({
          memno,
          email,
          fullname,
          memphno,
          packages: savedPackages,
          userId
      });

      await newMember.save();

      console.log('Member details saved:', newMember);

      res.status(200).json({
          status: 'SUCCESS',
          message: 'Email sent and member details saved successfully',
          memberDetails: newMember,
      });
  } catch (error) {
      console.error('Error saving member:', error);
      return res.status(500).json({ status: 'ERROR', message: 'Error saving member details' });
  }
};



const getMembers = async (req, res) => {
  try {
    const members = await Members.find({ userId: req.user });
    res.status(200).json({ status: 'SUCCESS', data: members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ status: 'ERROR', message: 'Error fetching members' });
  }
};
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


const updateMember =  async (req, res) => {
  const { email } = req.params;
  const { memphno } = req.body;

  // Validate the required fields
  if (!memphno) {
    return res.status(400).json({ status: 'ERROR', message: 'Missing required fields: memphno, doj, and doe' });
  }

  try {
    // Find and update the member by email
    const updatedMember = await Members.findOneAndUpdate(
      { email },
      { memphno},
      { new: true }  // This ensures the updated member data is returned
    );

    if (!updatedMember) {
      return res.status(404).json({ status: 'ERROR', message: 'Member not found' });
    }

    // Continue with email sending and response...
    const emailContent = `
      <h3>Hello ${updatedMember.fullname},</h3>
      <p>Member ID: ${updatedMember.memno}</p>
      <p>Your membership details have been updated. Here are your new subscription details:</p>
      <table border="1" style="border-collapse: collapse; width: 100%; text-align: left;">
        <thead>
          <tr>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${memphno}</td>
          </tr>
        </tbody>
      </table>
    `;

    const emailSent = await sendEmail(updatedMember.email, 'Your Membership Details Have Been Updated', emailContent);

    if (!emailSent) {
      return res.status(500).json({ status: 'ERROR', message: 'Error sending updated email' });
    }

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Member details updated and email sent successfully',
      updatedMember,
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ status: 'ERROR', message: 'Error updating member details', error });
  }
};

const addMorePlans = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
      return res.status(400).json({ status: 'ERROR', message: 'Token not provided' });
  }
  try {
      const memno = req.params.memno;
      const newPackages = req.body.packages; 
      const userId = req.user;


      if (!newPackages || !Array.isArray(newPackages) || newPackages.length === 0) {
          return res.status(400).json({ message: 'Packages are required and must be a non-empty array' });
      }

      const updatedMember = await Members.findOne({ memno: memno }); 

      if (!updatedMember) {
          return res.status(404).json({ message: 'Member not found!' });
      }

      const response = await axios.get('http://localhost:3000/addplans', {
        headers: { Authorization: `Bearer ${token}` }
    });
      const availablePlans = response.data.filter(plan => plan.userId === userId);

      const savedPackages = [];
      let paymentdate = moment().format('YYYY-MM-DD');

      for (const packageItem of newPackages) {
          const { plan, price, doj } = packageItem; 

          const selectedPlan = availablePlans.find(p => p.planname === plan);

          if (!selectedPlan) {
              return res.status(400).json({ message: `Plan "${plan}" not found for this user.` });
          }

          let calculatedDoe;
          try {
              const startDate = moment(doj, 'YYYY-MM-DD'); 
              calculatedDoe = startDate.add(selectedPlan.validity, 'months').format('YYYY-MM-DD');
          } catch (error) {
              console.error('Error calculating end date:', error);
              return res.status(500).json({ message: 'Error calculating end date' });
          }

          const newPackage = {
              plan: selectedPlan.planname,
              price: parseFloat(price),
              doj: doj,
              doe: calculatedDoe,
              paymentdate: paymentdate
          };

          savedPackages.push(newPackage);
      }


      const result = await Members.findOneAndUpdate(
          { memno: memno },
          { $push: { packages: { $each: savedPackages } } },
          { new: true, runValidators: true }
      );

      if (!result) {
          return res.status(500).json({ message: "Failed to update member." });  // Or handle the error as needed
      }

      let emailContent = `
        <h3>Hello ${updatedMember.fullname},</h3>
        <p>Member ID: ${updatedMember.memno}</p>
        <p>Your membership details have been updated. Here are your new subscription details:</p>
        <table border="1" style="border-collapse: collapse; width: 100%; text-align: left;">
        <thead>
          <tr>
            <th>Plan Name</th>
            <th>Price</th>
            <th>Start Date</th>
            <th>End Date</th>
          </tr>
        </thead>
        <tbody>
        `;

        result.packages.forEach(pkg => {
          emailContent += `
          <tr>
            <td>${pkg.plan}</td>
            <td>${pkg.price}</td>
            <td>${pkg.doj}</td>
            <td>${pkg.doe}</td>
          </tr>`;
        });

        emailContent += `
          </tbody>
        </table>`;

        const emailSent = await sendEmail(updatedMember.email, 'Your Membership Details Have Been Updated', emailContent);

        if(!emailSent) {
          return res.status(500).json({ status: 'ERROR', message: 'Error sending updated email'});
        }
      res.status(200).json(result);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
};

const getlastmemno = async (req, res) => {
  try {
    const lastMember = await Members.findOne({}, { memno: 1}, { sort: {memno: -1}});
    if(lastMember) {
      res.json({ lastMemNo: lastMember.memno});
    } else {
      res.json({ lastMemNo: 0});
    }
  } catch (error){
   console.error("Error fetching last memno:", error);
   res.status(500).json({ message: 'Error fetching last memno'});
  }
}


// Export functions
exports.addMembers = addMembers;
exports.getMembers = getMembers;
exports.deleteMember = deleteMember;
exports.updateMember = updateMember;
exports.addMorePlans = addMorePlans;
exports.getlastmemno = getlastmemno;


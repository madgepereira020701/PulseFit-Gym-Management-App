const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://gym:workout@cluster0.ie8js.mongodb.net/Gym-Admin?retryWrites=true&w=majority&appName=Cluster0';
const Members = require('../models/members');
const cron = require('node-cron');
const moment = require('moment');
const axios = require('axios'); // Make sure to install axios
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

  const addRenewals = async (req, res) => {


    const token = req.headers['authorization']?.split(' ')[1];
    if(!token) {
      return res.status(400).json({status: 'ERROR', message: 'Token not provided' });
    }
  
    //const totalPrice = dateGroups.reduce((total, group) => total + parseFloat(group.price), 0).toFixed(2);
  
  
  
    try {
      const memno = req.params.memno;
      console.log("req.body:", req.body); // <-- Crucial debugging step
  
      const newPackages = req.body.packages;
      const userId = req.user;
  
  
  
      if (!newPackages || !Array.isArray(newPackages) || newPackages.length === 0) {
        return res.status(400).json({ message: 'Packages are required and must be a non-empty array' });
    }
  
    
  
      const member  = await Members.findOne({memno: memno});
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
    }
  
      const response = await axios.get('http://localhost:3000/addplans', { 
         headers: { Authorization: `Bearer ${token}` }
      });
      const availablePlans = response.data.filter(plan => plan.userId === userId);
      const savedPackages = [];
      let paymentdate = moment().format('YYYY-MM-DD');
  
      for(const packageItem of newPackages) {
        const { plan, price, doj } = packageItem;
  
        const selectedPlan = availablePlans.find(
          (p) => p.planname && plan && p.planname.trim().toLowerCase() === plan.trim().toLowerCase()
        );
        if(!selectedPlan) {
          console.log('No matching plan found.');
          return res.status(400).json({ status: 'ERROR', message: 'Invalid plan selected for this user '});
        }
        let calculatedDoe;
        try {
          const startDate = moment(doj, 'YYYY-MM-DD');
          calculatedDoe = startDate.add(selectedPlan.validity, 'months').format('YYYY-MM-DD');
        } catch (error) {
          console.error('Error calculating end date', error);
          return res.status(500).json({ status: 'ERROR', message: 'Error calculating end date' });
        }
        const newPackage = {
          plan: selectedPlan.planname,
          price: parseFloat(price),
          doj: doj,
          doe: calculatedDoe,
          paymentdate: paymentdate
        }
        savedPackages.push(newPackage);
  
  
  
  
    let emailContent = `
    <h3>Hello ${member.fullname},</h3>
    <p>Member Number: ${member.memno}</p>
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
  
  const emailSent = await sendEmail(member.email, 'Plan Subscription Details', emailContent);
  
  if (!emailSent) {
    return res.status(500).json({ status: 'ERROR', message: 'Error sending renewal email' });
  }
  
  }
  
  
      const newRenewal = await Members.findOneAndUpdate(
        { memno: memno },
        { $push: { packages: {$each: savedPackages}}},
        { new: true, upsert: true, runValidators: true }
      );
  
   
  
  
      res.status(200).json({
        status: 'SUCCESS',
        message: 'Email sent and renewal details saved successfully',
        //totalPrice,
        renewalDetails: newRenewal,
      });
    } catch (error) {
      console.error('Error saving renewal:', error);
      res.status(500).json({ status: 'ERROR', message: 'Error saving renewal details' });
    }
  };
  
  // Endpoint to Fetch Renewals
  const getRenewals = async (req, res) => {
    try {
      const renewals = await Members.find({userId: req.user});
      res.status(200).json({ status: 'SUCCESS', data: renewals });
    } catch (error) {
      console.error('Error fetching renewals:', error);
      res.status(500).json({ status: 'ERROR', message: 'Error fetching renewals' });
    }
  };


    
  cron.schedule('* * * * *', async () => {
    try {
        const sevenDaysAhead = moment().add(7, 'days').startOf('day').format('YYYY-MM-DD');
        console.log('Checking for renewals expiring on:', sevenDaysAhead);

        const renewalsExpiringSoon = await Members.find({
            'packages.doe': sevenDaysAhead
        }).populate('userId');

        if (renewalsExpiringSoon.length === 0) {
            console.log('No renewals expiring in 7 days.');
            return;
        }

        console.log('Found renewals expiring soon:', renewalsExpiringSoon);

        for (const renewal of renewalsExpiringSoon) {
            if (!renewal || !renewal.packages || !Array.isArray(renewal.packages)) {
                console.error('Invalid renewal data:', renewal);
                continue;
            }

            const expiringPackages = renewal.packages.filter(pkg => pkg.doe === sevenDaysAhead);

            if (expiringPackages.length > 0) { // Check if there are any expiring packages for this member
                const member = await Members.findOne({
                    memno: renewal.memno,
                    userId: renewal.userId
                }).select('fullname email');

                if (member) {
                    let emailContent = `
                        <h3>Hello ${member.fullname},</h3>
                        <p>Member Number: ${renewal.memno}</p>
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

                    expiringPackages.forEach(pkg => { // Iterate over the FILTERED expiring packages
                        emailContent += `
                            <tr>
                                <td>${pkg.plan}</td>
                                <td>${pkg.doj}</td>
                                <td>${pkg.doe}</td>
                                <td>${pkg.price}</td>
                            </tr>`;
                    });

                    emailContent += `
                            </tbody>
                        </table>`;

                    const emailSent = await sendEmail(member.email, 'Reminder: Your Subscription is Ending Soon', emailContent);

                    if (emailSent) {
                        console.log(`Reminder email sent to ${member.email}`);
                    } else {
                        console.error(`Failed to send reminder email to ${member.email}`);
                    }
                } else {
                    console.log(`No member found for memno: ${renewal.memno}`);
                }
            } // End of if (expiringPackages.length > 0)
        } // End of for (const renewal of renewalsExpiringSoon)
    } catch (error) {
        console.error('Error during cron job execution:', error);
    }
});


exports.addRenewals = addRenewals;
exports.getRenewals = getRenewals;


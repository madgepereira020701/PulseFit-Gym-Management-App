const Members = require('../models/members');
const cron = require('node-cron');
const moment = require('moment');
const axios = require('axios'); // Make sure to install axios
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '', //Your Email
      pass: '', // Use an app-specific password for Gmail
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
      from: '', //Your email
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
  
      const newPackage = req.body.packages;
      const userId = req.user;
  
  
  
      if (!newPackage || typeof newPackage!== 'object' || Object.keys(newPackage).length === 0) {
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
      let paymentdate = moment().format('YYYY-MM-DD');
  
        const { plan, price, doj } = newPackage;
  
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
        const savedPackage = {
          plan: selectedPlan.planname,
          price: parseFloat(price),
          doj: doj,
          doe: calculatedDoe,
          paymentdate: paymentdate
        }
  
  
  
  
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
      <tbody>
          <tr>
            <td>${savedPackage.plan}</td>
            <td>${savedPackage.doj}</td>
            <td>${savedPackage.doe}</td>
            <td>${savedPackage.price}</td>
          </tr>
      </tbody>
    </table>
  `;
  
  const emailSent = await sendEmail(member.email, 'Plan Subscription Details', emailContent);
  
  if (!emailSent) {
    return res.status(500).json({ status: 'ERROR', message: 'Error sending renewal email' });
  }
  
  
  
      const newRenewal = await Members.findOneAndUpdate(
        { memno: memno },
        { $push: { packages: savedPackage}},
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

  const getLatestRenewals = async (req, res) => {
    try {
      const { memno, plan } = req.params;

      const member = await Members.findOne({userId: req.user, memno: memno, 'packages.plan': plan});
      if(!member) {
        return res.status(404).json({ status: 'ERROR', message: 'Member not found'});
      }
      const planPackages = member.packages.filter(pkg => pkg.plan === plan);
      if(planPackages.length === 0) {
        return res.status(404).json({ status: 'ERROR', message: 'No packages found for this plan'});
      }

      let latestPackage = planPackages.reduce((latest, current ) => {
        const latestDate = new Date(latest.doe);
        const currentDate = new Date(current.doe);
        return currentDate > latestDate ? current : latest;
      })

      res.status(200).json({ status: 'SUCCESS', data: latestPackage });
    } catch (error) {
      console.error('Error fetching renewals:', error);
      res.status(500).json({ status: 'ERROR', message: 'Error fetching renewals' });
    }
  };


    
  cron.schedule('0 9 * * *', async () => {
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


        for (const renewal of renewalsExpiringSoon) {
          let allPlansHaveRenewal = true;
          const expiringWithoutRenewal = [];
            if (!renewal || !renewal.packages || !Array.isArray(renewal.packages)) {
                console.error('Invalid renewal data:', renewal);
                continue;
            }

            renewal.packages.sort((a,b) => new Date(b.doe) - new Date(a.doe));
            
            const latestPlans = {};
            renewal.packages.forEach(item => {
              if(!latestPlans[item.plan] || new Date(item.doj) > new Date(latestPlans[item.plan].doj)){
                latestPlans[item.plan] = item;
              }
            });

            const expiringPackages = renewal.packages.filter(pkg => pkg.doe === sevenDaysAhead);

            for(const expiringPkg of expiringPackages) {
              const latestPlanForType = latestPlans[expiringPkg.plan];

              const hasMatchingRenewal = latestPlanForType && 
              new Date(latestPlanForType.doj) > new Date(expiringPkg.doj) &&
              latestPlanForType.doe !== sevenDaysAhead;
              
              if(!hasMatchingRenewal) {
                allPlansHaveRenewal = false;
                expiringWithoutRenewal.push(expiringPkg);
              }
            }

            if(!allPlansHaveRenewal) {
              console.log('Found renewals expiring soon:', expiringWithoutRenewal);
            
            for (const expiringPkg of expiringWithoutRenewal) { // Check if there are any expiring packages for this member
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

                        emailContent += `
                            <tr>
                                <td>${expiringPkg.plan}</td>
                                <td>${expiringPkg.doj}</td>
                                <td>${expiringPkg.doe}</td>
                                <td>${expiringPkg.price}</td>
                            </tr>`;

                    emailContent += `
                            </tbody>
                        </table>`;

                    const emailSent = await sendEmail(member.email, 'Reminder: Your Subscription is Ending Soon', emailContent);

                    if (emailSent) {
                        console.log(`Reminder email sent to ${member.fullname}`);
                    } else {
                        console.error(`Failed to send reminder email to ${member.email}`);
                    }
                } else {
                    console.log(`No member found for memno: ${renewal.memno}`);
                }
              }
            } 
            else {
              const member = await Members.findOne({
                memno: renewal.memno,
                userId: renewal.userId
              }).select('fullname');
              
              if (member) {
                console.log(`${member.fullname} has all expiring plans covered by newer plans. Skipping.`)
        }
       }
       } 
    } catch (error) {
        console.error('Error during cron job execution:', error);
    }
});


exports.addRenewals = addRenewals;
exports.getRenewals = getRenewals;
exports.getLatestRenewals = getLatestRenewals;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Renewals.css';
import moment from 'moment';



const Payments = () => {
  const [ payments, setPayments ] =  useState([]);
  const [error, setError] = useState('');
  const { memno } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
const fetchPayments = async () => {
  const token = localStorage.getItem('token');
  if(!token) {
    console.log('No token found');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/payments/${memno}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,  // Add token in Authorization header
        },
      }
    );
    if(!response.ok) {
      throw new Error('Failed to fetch payment details');
    }
    const data = await response.json();
    setPayments([data.data]);
  } catch (err) {
    setError(err.message);
  }
 };
 if(memno) {
  fetchPayments();
 }
}, [memno]);

const handleNavigation = (selectedPlan) => {
  navigate(`/addrenewals/${selectedPlan}`);
};

const isExpiringSoon = (doe) => {
  if(!doe) return false;
  const expirationDate = moment(doe);
  const sevenDaysAhead = moment().add(7, 'days').startOf('day');
  return expirationDate.isSame(sevenDaysAhead, 'day');
}

return(
  <div className="table-container">
    <h2>Renewals</h2>
    {error && <p className='error-message'>{error}</p>}
    {payments.length > 0 && (
    <div className='renewals-table-wrapper'>
      <table className='renewals-table'>
        <thead>
          <tr>
              <th>Plan</th>
              <th>Join Date</th>
              <th>End Date</th>
              <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => {
            const latestPlans = {};
            const allitems = [...(payment.packages || [])];
            
            allitems.forEach(item => {
              if(!latestPlans[item.plan] || new Date(item.doj) > new Date(latestPlans[item.plan].doj) )
              {
                latestPlans[item.plan] = item;
              }
              });

              const uniqueItems = Object.values(latestPlans);
            return (
              <React.Fragment key={index}>
                {uniqueItems && uniqueItems.map((item,idx) => (
                  <tr key={`${index}-${idx}`} className={isExpiringSoon(item.doe) ? 'expiring-soon' : ''}>
                    <td>{item.plan}</td>
                    <td>{item.doj}</td>
                    <td>{item.doe}</td>
                    <td className='actions'>
                      <button className='membutton' onClick={() => handleNavigation(item.plan)}>Renew</button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      </div>
    )}
  </div>
);

};

export default Payments;
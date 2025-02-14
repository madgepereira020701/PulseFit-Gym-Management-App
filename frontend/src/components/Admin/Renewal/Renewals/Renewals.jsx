import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Renewals.css';



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

const handleNavigation = () => {
  navigate(`/addrenewals/${memno}`);
};

return(
  <div className="table-container">
    <h2>Renewals</h2>
    {error && <p className='error-message'>{error}</p>}
    {payments.length > 0 && (
      <table className='payments-table'>
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
            const allitems = [...(payment.packages || []), ...(payment.renewals || [])];
            
            allitems.forEach(item => {
              if(!latestPlans[item.plan] || new Date(item.dos || item.doj) > new Date(latestPlans[item.plan].dos || latestPlans[item.plan].doj) )
              {
                latestPlans[item.plan] = item;
              }
              });

              const uniqueItems = Object.values(latestPlans);
            return (
              <React.Fragment key={index}>
                {uniqueItems && uniqueItems.map((item,idx) => (
                  <tr key={`${index}-${idx}`}>
                    <td>{item.plan}</td>
                    <td>{item.doj || item.dos}</td>
                    <td>{item.doe}</td>
                    <td className='actions'>
                      <button className='membutton' onClick={() => handleNavigation()}>Renew</button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    )}
  </div>
);

};

export default Payments;
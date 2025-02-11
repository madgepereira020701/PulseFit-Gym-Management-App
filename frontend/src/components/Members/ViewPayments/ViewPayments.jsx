import React, { useState, useEffect } from 'react';
import './ViewPayments.css';

const ViewPayments1 = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');

  // Fetch payments data on component mount
  useEffect(() => {
    const fetchPayments = async () => {


      const token = localStorage.getItem('token');  // Get token from localStorage
      if (!token) {
        console.log('No token found');
        return;
      }
     
      try {
        const response = await fetch(`http://localhost:3000/payments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,  // Add token in Authorization header
            },
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }
        const data = await response.json();
        setPayments([data.data]); // Set the payment data array based on the response
      } catch (err) {
        setError(err.message);
      }
    };

      fetchPayments();
    
  }, []);

  return (
    <div className="table-container">
      <h2>Payments Details</h2>
      {error && <p className="error-message">{error}</p>}
      {payments.length > 0 && (
        <table className="payments-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Price</th>
              <th>Join Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => {
              const allitems = [...(payment.packages || []), ...(payment.renewals || [])]

              return (
                <React.Fragment key={index}>
                  {/* Render main payment info with rowSpan */}
                    { allitems && allitems.map((item, idx) => (
                    <tr key={`${index}-${idx}`}>
                    <td>{item.plan}</td>
                    <td>{item.price}</td>
                    <td>{item.doj || item.dos}</td>
                    <td>{item.doe}</td>
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

export default ViewPayments1;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './MemRecords.css';

const ViewPayments = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const { memno } = useParams(); // Get `memno` from URL params

  // Fetch payments data on component mount
  useEffect(() => {
    const fetchPayments = async () => {


      const token = localStorage.getItem('token');  // Get token from localStorage
      if (!token) {
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
        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }
        const data = await response.json();
        setPayments([data.data]); // Set the payment data array based on the response
      } catch (err) {
        setError(err.message);
      }
    };

    if (memno) {
      fetchPayments();
    }
  }, [memno]);

  return (
    <div className="table-container">
      <h2>Payments Details</h2>
      {error && <p className="error-message">{error}</p>}
      {payments.length > 0 && (
        <table className="payments-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Plan</th>
              <th>Price</th>
              <th>Join Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => {
              const totalRows = payment.renewals ? payment.renewals.length + 1 : 1; // Total rows to display for this payment

              return (
                <React.Fragment key={index}>
                  {/* Render main payment info with rowSpan */}
                  <tr>
                    <td rowSpan={totalRows}>{payment.fullname}</td>
                    <td>{payment.plan}</td>
                    <td>{payment.price}</td>
                    <td>{payment.doj}</td>
                    <td>{payment.doe}</td>
                  </tr>
                  
                  {/* Render renewal plans */}
                  {payment.renewals && payment.renewals.map((renewal, idx) => (
                    <tr key={`${index}-${idx}`}>
                      <td>{renewal.plan}</td>
                      <td>{renewal.price}</td>
                      <td>{renewal.dos}</td>
                      <td>{renewal.doe}</td>
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

export default ViewPayments;

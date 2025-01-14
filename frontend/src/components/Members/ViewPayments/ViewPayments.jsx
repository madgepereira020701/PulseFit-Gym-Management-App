import React, { useState, useEffect } from 'react';
import './ViewPayments.css';

const ViewPayments1 = () => {
  const [payments, setPayments] = useState(null); // Using null initially for clarity
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        console.log('No token found');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/payments', {
          headers: {
            Authorization: `Bearer ${token}`, // Add token in Authorization header
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }

        const data = await response.json();
        setPayments(data.data); // Assuming data.data contains the payment details object
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
      {payments ? (
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
            <tr>
              <td>{payments.plan}</td>
              <td>{payments.price}</td>
              <td>{payments.doj}</td>
              <td>{payments.doe}</td>
            </tr>
            {payments.renewals &&
              payments.renewals.map((renewal, idx) => (
                <tr key={idx}>
                  <td>{renewal.plan}</td>
                  <td>{renewal.price}</td>
                  <td>{renewal.dos}</td>
                  <td>{renewal.doe}</td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <p>No payment details found</p>
      )}
    </div>
  );
};

export default ViewPayments1;

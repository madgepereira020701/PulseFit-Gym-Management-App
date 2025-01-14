import React, { useEffect, useState } from 'react';
import './Plans.css';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {

      const token = localStorage.getItem('token');  // Get token from localStorage
      if (!token) {
        console.log('No token found');
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/addplans' ,{
          headers: {
            Authorization: `Bearer ${token}`,  // Add token in Authorization header
          },
        });
        const data = await response.json();
        console.log(data); // Debug: Check the structure of the fetched data
        setPlans(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="table-plan-container">
      <h2>Packages List</h2>
      {error && <p className="error-message">{error}</p>}
      {!error && plans.length === 0 && <p>No plans found.</p>}
      {plans.length > 0 && (
        <table className="plan-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Validity(in months)</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan, index) => (
              <tr key={index}>
                <td>{plan.planname}</td>
                <td>{plan.validity}</td>
                <td>{plan.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Plans;

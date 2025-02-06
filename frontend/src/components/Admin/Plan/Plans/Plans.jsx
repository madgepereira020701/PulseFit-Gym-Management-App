import React, { useEffect, useState } from 'react';
import './Plans.css';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [updatedDetails, setUpdatedDetails] = useState({
    planname: '',
    validity: '',
    amount: ''
  })

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

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setUpdatedDetails({
      planname: plan.planname,
      validity: plan.validity,
      amount: plan.amount
    });
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDetails({ ...updatedDetails, [name]: value });
  }
  const handleUpdatePlan = async () => {
    const token = localStorage.getItem('token');
    if(!token) {
      console.log('No token found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/addplans/${updatedDetails.planname}` , {
        method: 'PATCH',
        headers : {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDetails),
      });

      const data = await response.json();
      if(!response.ok) {
        throw new Error(data.message || 'Failed to update plan');
      }

      setPlans((prevPlans) => 
      prevPlans.map((plan) => 
      plan.amount === updatedDetails.amount ? { ...plan, ...updatedDetails } : plan)
      )

      setEditingPlan(null);
      setError(null);
      alert('Plan details updated successfully');
    } catch(error) {
      setError(error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
    setUpdatedDetails({
      validity: '',
      amount: ''
    })
  }

  const handleDeletePlan = async (planname) => {
    const token = localStorage.getItem('token');
    if(!token) {
      console.log('No token found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/addplans/${planname}` , {
        method: 'DELETE',
        headers : {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if(!response.ok) {
        throw new Error(data.message || 'Failed to delete plan');
      }

      setPlans(plans.filter((plan) => plan.planname !== planname ));
      alert('Plan details deleted successfully');
    } catch(error) {
      setError(error.message);
    }
  }
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan, index) => (
              <tr key={index}>
                <td>{plan.planname}</td>
                <td>{plan.validity}</td>
                <td>{plan.amount}</td>
                <td className='actions'>
                  <button className="planbutton" onClick={() => handleEdit(plan)}>Edit</button>
                  <button className="planbutton" onClick={() => handleDeletePlan(plan.planname)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

{editingPlan && (
  <div className="edit-form">
    <h3>Edit Plan</h3>
    <label>Validity:</label>
    <input 
      type="number"
      name="validity"
      className="input-field"
      value={updatedDetails.validity}
      onChange={handleUpdateChange}
    />
    <label>Amount:</label>
    <input 
      type="number"
      name="amount"
      className="input-field"
      value={updatedDetails.amount}
      onChange={handleUpdateChange}
    />

{error && <p className="error-message">{error}</p>}

<div className="button-group">
  <button onClick={handleUpdatePlan} className='add'>Update</button>
  <button onClick={handleCancelEdit} className='cancel'>Cancel</button>
</div>

  </div>
)}
    </div>


  );
};

export default Plans;

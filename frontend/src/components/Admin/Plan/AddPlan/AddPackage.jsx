import React, { useState } from 'react';
import './AddPackage.css';
import Plans from '../Plans/Plans';

const addPlanInitialValues = {
  planname: '',
  validity: '',
  amount: '',
};

const AddPlan = () => {
  const [addPlan, setAddPlan] = useState(addPlanInitialValues);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState({});

  const addplan = async () => {
    // Validation checks
    if (Object.values(addPlan).some((value) => value.trim() === '')) {
      setError('Please fill in all fields.');
      return;
    }

    if (Object.keys(warnings).length > 0) {
      setError('Please resolve all validation warnings.');
      return;
    }

    const extraFields = Object.keys(addPlan).filter(
      (key) => !(key in addPlanInitialValues)
    );
    if (extraFields.length > 0) {
      setError('Invalid fields detected. Please refresh and try again.');
      return;
    }

    const token = localStorage.getItem('token'); // Get token from localStorage
    if (!token) {
      console.log('No token found');
      return;
    }

    const formData = {
      ...addPlan,
      amount: parseInt(addPlan.amount, 10),
      validity: parseInt(addPlan.validity, 10),
    };

    try {
      const response = await fetch('http://localhost:3000/addplans', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add plan');
      }

      setAddPlan(addPlanInitialValues);
      setError('');
      alert('Plan added successfully!');
    } catch (error) {
      setError('There was an error submitting the form. Please try again.');
    }
  };

  const validateFields = (field, value) => {
    const newWarnings = { ...warnings };

    if (field === 'planname') {
      if (value.trim() === '') {
        newWarnings.planname = 'Plan name is required';
      } else {
        delete newWarnings.planname;
      }
    }

    if (field === 'validity') {
      if (value.trim() === '' || isNaN(value) || Number(value) <= 0) {
        newWarnings.validity = 'Validity should be a positive number';
      } else {
        delete newWarnings.validity;
      }
    }

    if (field === 'amount') {
      if (value.trim() === '' || isNaN(value) || Number(value) <= 0) {
        newWarnings.amount = 'Amount should be a positive number';
      } else {
        delete newWarnings.amount;
      }
    }

    setWarnings(newWarnings);
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input Change - ${name}: ${value}`); // Log input changes
    setAddPlan((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    validateFields(name, value);
  };

  return (
    <div className="auth-container">
      <div className="flex-container">
        <div className="form-container">
          <h2>Add Package</h2>
          <label>Plan</label>
          <input
            type="text"
            name="planname"
            placeholder="Plan Name"
            className="input-field"
            value={addPlan.planname} // Bind state to the input
            onChange={onInputChange}
          />
          {warnings.planname && <p className="warning-message">{warnings.planname}</p>}
          <br /><br />

          <label>Validity (in months)</label>
          <input
            type="number"
            name="validity"
            placeholder="Validity"
            className="input-field"
            value={addPlan.validity} // Bind state to the input
            onChange={onInputChange}
          />
          {warnings.validity && <p className="warning-message">{warnings.validity}</p>}
          <br /><br />

          <label>Amount</label>
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            className="input-field"
            value={addPlan.amount} // Bind state to the input
            onChange={onInputChange}
          />
          {warnings.amount && <p className="warning-message">{warnings.amount}</p>}

          {error && <p className="error-message">{error}</p>}

          <div className="button-group">
            <button className="cancel">Cancel</button>
            <button className="save" onClick={addplan}>Add</button>
          </div>
        </div>
        <Plans />
      </div>
    </div>
  );
};

export default AddPlan;

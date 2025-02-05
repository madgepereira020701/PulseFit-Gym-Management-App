
import React, { useState, useEffect } from 'react';
import './AddMember.css';

const addMemberInitialValues = {
  fullname: '',
  memno: '',
  memphno: '',
  email: '',
  doj: '',
  doe: '',
  plan: '',
  price: '',
};

const AddMembers = () => {
  const [addMember, setAddMember] = useState(addMemberInitialValues);
  const [plans, setPlans] = useState([]); // Holds the available plans
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState({});

  // Fetch plans data on component mount
  useEffect(() => {
    const fetchPlans = async () => {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        console.error('No token found');
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/addplans', {
          headers: {
            Authorization: `Bearer ${token}`, // Add token in Authorization header
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch plans');
        }
        setPlans(data); // Assuming data is an array of plan objects
      } catch (err) {
        console.error('Error fetching plans:', err.message);
      }
    };

    fetchPlans();
  }, []);

  // Handle form input changes
  const onInputChange = (e) => {
    const { name, value } = e.target;

    let updatedMember = { ...addMember, [name]: value };

    // Update price and end date based on selected plan
    if (name === 'plan') {
      const selectedPlan = plans.find((plan) => plan.planname === value);
      if (selectedPlan) {
        const validityInMonths = selectedPlan.validity;
        updatedMember.price = selectedPlan.amount.toString();

        if (addMember.doj) {
          const startDate = new Date(addMember.doj);
          const endDate = new Date(startDate);
          endDate.setMonth(startDate.getMonth() + validityInMonths);
          updatedMember.doe = endDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
      } else {
        updatedMember.price = '';
        updatedMember.doe = '';
      }
    }

    // Update end date when joining date is modified
    if (name === 'doj' && addMember.plan) {
      const selectedPlan = plans.find((plan) => plan.planname === addMember.plan);
      if (selectedPlan) {
        const validityInMonths = selectedPlan.validity;
        const startDate = new Date(value);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + validityInMonths);
        updatedMember.doe = endDate.toISOString().split('T')[0];
      } else {
        updatedMember.doe = '';
      }
    }

    setAddMember(updatedMember);
    validateFields(name, value);
  };

  // Validate form fields
  const validateFields = (field, value) => {
    const newWarnings = { ...warnings };

    if (field === 'fullname' && value.trim() === '') {
      newWarnings.fullname = 'Full Name is required';
    } else {
      delete newWarnings.fullname;
    }

    if (field === 'memno' && (value.trim() === '' || isNaN(value))) {
      newWarnings.memno = 'Member Number should be a valid number';
    } else {
      delete newWarnings.memno;
    }

    if (field === 'memphno' && (value.trim() === '' || value.length !== 10)) {
      newWarnings.memphno = 'Phone Number should be a 10-digit number';
    } else {
      delete newWarnings.memphno;
    }

    if (field === 'email' && !validateEmail(value)) {
      newWarnings.email = 'Please enter a valid email address';
    } else {
      delete newWarnings.email;
    }

    if (field === 'price' && (isNaN(value) || Number(value) <= 0)) {
      newWarnings.price = 'Price should be a positive number';
    } else {
      delete newWarnings.price;
    }

    if (field === 'doj' && value.trim() === '') {
      newWarnings.doj = 'Date of Joining is required';
    } else {
      delete newWarnings.doj;
    }

    setWarnings(newWarnings);
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const addMemberHandler = async () => {
    if (Object.values(addMember).some((value) => value.trim() === '')) {
      setError('Please fill in all fields.');
      return;
    }

    if (Object.keys(warnings).length > 0) {
      setError('Please resolve all validation warnings.');
      return;
    }

    const token = localStorage.getItem('token'); // Get token from localStorage
    if (!token) {
      console.error('No token found');
      return;
    }

    const formData = {
      ...addMember,
      memno: parseInt(addMember.memno, 10),
      memphno: parseInt(addMember.memphno, 10),
      price: parseFloat(addMember.price),
    };

    try {
      const response = await fetch('http://localhost:3000/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add member');
      }

      alert('Member added successfully!');
      setAddMember(addMemberInitialValues); // Reset form
      setError('');
    } catch (err) {
      console.error('Error adding member:', err.message);
      setError(err.message || 'There was an error submitting the form. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="form-container">
        <h2>Add Member</h2>

        <label>Full Name</label>
        <input
          type="text"
          name="fullname"
          placeholder="Full Name"
          className="input-field"
          value={addMember.fullname}
          onChange={onInputChange}
        />
        {warnings.fullname && <p className="warning-message">{warnings.fullname}</p>}
        <br /><br />


        <label>Member ID</label>
        <input
          type="number"
          name="memno"
          placeholder="Member ID"
          className="input-field"
          value={addMember.memno}
          onChange={onInputChange}
        />
        {warnings.memno && <p className="warning-message">{warnings.memno}</p>}
        <br />        <br />



        <label>Phone Number</label>
        <input
          type="number"
          name="memphno"
          placeholder="Phone Number"
          className="input-field"
          value={addMember.memphno}
          onChange={onInputChange}
        />
        {warnings.memphno && <p className="warning-message">{warnings.memphno}</p>}
        <br />        <br />


        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input-field"
          value={addMember.email}
          onChange={onInputChange}
        />
        {warnings.email && <p className="warning-message">{warnings.email}</p>}
        <br /><br />

        <div className="input-group">
         <div> 
        <label>Plan</label>
        <select
          name="plan"
          className="input-field3"
          value={addMember.plan}
          onChange={onInputChange}
        >
          <option value="">Select a Plan</option>
          {plans.map((plan, index) => (
            <option key={index} value={plan.planname}>
              {plan.planname} 
            </option>
          ))}
        </select>
        {warnings.plan && <p className="warning-message">{warnings.plan}</p>}
        </div>
       
        <div> 
        <label>Price</label>
        <input
          type="number"
          name="price"
          placeholder="Price"
          className="input-field3"
          value={addMember.price}
          onChange={onInputChange}
        />
        {warnings.price && <p className="warning-message">{warnings.price}</p>}
        </div>
        </div>
        <br />
        
        <div className="input-group">
        <div> 
        <label>Start Date</label>
        <input
          type="date"
          name="doj"
          placeholder="Date of Joining"
          className="input-field3"
          value={addMember.doj}
          onChange={onInputChange}
        />
        {warnings.doj && <p className="warning-message">{warnings.doj}</p>}
        </div>

        <div>
        <label>End Date</label>
        <input
          type="date"
          name="doe"
          placeholder="End Date"
          className="input-field3"
          value={addMember.doe}
          onChange={onInputChange}
          readOnly
        />
        {warnings.doe && <p className="warning-message">{warnings.doe}</p>}
        </div>
        </div>
        <br />




        {error && <p className="error-message">{error}</p>}

        <div className="button-group">
          <button className="cancel">Cancel</button>
          <button className="add" onClick={addMemberHandler}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMembers;   
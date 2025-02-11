
import React, { useState, useEffect } from 'react';
import './AddMember.css';

const addMemberInitialValues = {
  fullname: '',
  memno: '',
  memphno: '',
  email: '',
};

const AddMembers = () => {
  const [addMember, setAddMember] = useState(addMemberInitialValues);
  const [plans, setPlans] = useState([]); // Holds the available plans
  const [error, setError] = useState('');
  const [packages, setPackages] = useState([{plan:'', price:'',doj:'', doe:''}]);
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
      newWarnings.memno = 'Member ID should be a valid number';
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

    for (const packageItem of packages){
      if(!packageItem.plan || !packageItem.price || !packageItem.doj || !packageItem.doe)
      {
        setError('Please resolve all validation warnings.');
      return;
      }
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
      packages: packages.map((pkg)=> ({
       plan: pkg.plan,
       price: parseFloat(pkg.price),
       doj: pkg.doj,
       doe: pkg.doe
      }))
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
      setPackages([{plan:'', price:'',doj:'',doe:''}]);
      setError('');
    } catch (err) {
      console.error('Error adding member:', err.message);
      setError(err.message || 'There was an error submitting the form. Please try again.');
    }
  };

  const addPackage = () => {
    setPackages([...packages, {plan:'', price:'',doj:'',doe:''}]);
  }

  const removePackage = (index) => {
    const updatedPackages = packages.filter((_,i) => i!== index);
    setPackages(updatedPackages);
  }

  const handlePackageChange = (index,field,value) => {
    setPackages((prevPackages) => {
      
  
    const updatedPackages = [...prevPackages];
    updatedPackages[index][field] = value;
    if (field === 'plan') {
      const selectedPlan = plans.find((plan) => plan.planname === value);
      if (selectedPlan) {
        const validityInMonths = selectedPlan.validity;
        updatedPackages[index].price = selectedPlan.amount.toString();
        updatedPackages[index].plan = selectedPlan.planname;


        if (updatedPackages[index].doj) {
          const startDate = new Date(updatedPackages[index].doj);
          const endDate = new Date(startDate);
          endDate.setMonth(startDate.getMonth() + validityInMonths);
          updatedPackages[index].doe = endDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
      } else {
        updatedPackages[index].price = '';
        updatedPackages[index].doe = '';
      }
    }

    // Update end date when joining date is modified
    if (field === 'doj') {
      const selectedPlan = plans.find((plan) => plan.planname === updatedPackages[index].plan);
      if (selectedPlan) {
        const validityInMonths = selectedPlan.validity;
        const startDate = new Date(value);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + validityInMonths);
        updatedPackages[index].doe = endDate.toISOString().split('T')[0];
      } else {
        updatedPackages[index].doe = '';
      }
    }

    return updatedPackages;
    });
  }

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

       {packages.map((planrow,index) => (
        <div key={index}>
          <div className="input-group">
          <div> 
          <label>Plan</label>
          <select
            name="plan"
            className="input-field3"
            value={planrow.plan}
            onChange={(e) => handlePackageChange(index,'plan', e.target.value) }
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
            value={planrow.price}
            onChange={(e) => handlePackageChange(index,'price',e.target.value)}
          />
          {warnings.price && <p className="warning-message">{warnings.price}</p>}
          </div>
          </div>
    
          <div className="input-group">
          <div> 
          <label>Start Date</label>
          <input
            type="date"
            name="doj"
            placeholder="Date of Joining"
            className="input-field3"
            value={planrow.doj}
            onChange={(e) => handlePackageChange(index,'doj',e.target.value)}
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
            value={planrow.doe}
            onChange={(e) => handlePackageChange(index,'doe',e.target.value)}
            readOnly
          />
          {warnings.doe && <p className="warning-message">{warnings.doe}</p>}
          </div>
          </div>
         {index > 0 && (
          <button type="button"  className="cancel" onClick={() => removePackage(index)}>-</button>)}
        </div>

       ))}
        <button type="button" className="add" onClick={addPackage}>Add</button>
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
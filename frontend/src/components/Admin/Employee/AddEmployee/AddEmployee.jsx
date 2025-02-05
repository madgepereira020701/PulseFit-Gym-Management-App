
import React, { useState} from 'react';
import './AddEmployee.css';

const addEmployeeInitialValues = {
  fullname: '',
  emno: '',
  emphno: '',
  email: '',
  designation: '',
  department: '',
  doj: '',
};

const AddEmployees = () => {
  const [addEmployee, setAddEmployee] = useState(addEmployeeInitialValues);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState({});

  // Fetch plans data on component mount
  

  // Handle form input changes
  const onInputChange = (e) => {
    const { name, value } = e.target;

    let updatedEmployee = { ...addEmployee, [name]: value };
    setAddEmployee(updatedEmployee);
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

    if (field === 'emno' && (value.trim() === '' || isNaN(value))) {
      newWarnings.memno = 'Employee Number should be a valid number';
    } else {
      delete newWarnings.memno;
    }

    if (field === 'emphno' && (value.trim() === '' || value.length !== 10)) {
      newWarnings.emphno = 'Phone Number should be a 10-digit number';
    } else {
      delete newWarnings.emphno;
    }

    if (field === 'email' && !validateEmail(value)) {
      newWarnings.email = 'Please enter a valid email address';
    } else {
      delete newWarnings.email;
    }



    if (field === 'designation' && value.trim() === '') {
        newWarnings.designation = 'Designation is required';
      } else {
        delete newWarnings.designation;
      }


      if (field === 'department' && value.trim() === '') {
        newWarnings.department = 'Department is required';
      } else {
        delete newWarnings.department;
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
  const addEmployeeHandler = async () => {
    if (Object.values(addEmployee).some((value) => value.trim() === '')) {
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
      ...addEmployee,
      emno: parseInt(addEmployee.emno, 10),
      emphno: parseInt(addEmployee.emphno, 10),
    };

    try {
      const response = await fetch('http://localhost:3000/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add employee');
      }

      alert('Employee added successfully!');
      setAddEmployee(addEmployeeInitialValues); // Reset form
      setError('');
    } catch (err) {
      console.error('Error adding member:', err.message);
      setError(err.message || 'There was an error submitting the form. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="form-container">
        <h2>Add Employee</h2>

        <label>Full Name</label>
        <input
          type="text"
          name="fullname"
          placeholder="Full Name"
          className="input-field"
          value={addEmployee.fullname}
          onChange={onInputChange}
        />
        {warnings.fullname && <p className="warning-message">{warnings.fullname}</p>}
        <br /><br />


        <div className="input-group">
        <div>
        <label>Employee ID</label>
        <input
          type="number"
          name="emno"
          placeholder="Member Number"
          className="input-field"
          value={addEmployee.emno}
          onChange={onInputChange}
        />
        {warnings.emno && <p className="warning-message">{warnings.memno}</p>}
        </div>
        <div> 
        <label>Start Date</label>
        <input
          type="date"
          name="doj"
          placeholder="Date of Joining"
          className="input-field"
          value={addEmployee.doj}
          onChange={onInputChange}
        />
        {warnings.doj && <p className="warning-message">{warnings.doj}</p>}
        </div>
       </div>


        <label>Phone Number</label>
        <input
          type="number"
          name="emphno"
          placeholder="Phone Number"
          className="input-field"
          value={addEmployee.emphno}
          onChange={onInputChange}
        />
        {warnings.emphno && <p className="warning-message">{warnings.emphno}</p>}
        <br />        <br />


        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input-field"
          value={addEmployee.email}
          onChange={onInputChange}
        />
        {warnings.email && <p className="warning-message">{warnings.email}</p>}
        <br /><br />

        <label>Designation</label>
        <input
          type="text"
          name="designation"
          placeholder="Designation"
          className="input-field"
          value={addEmployee.designation}
          onChange={onInputChange}
        />
        {warnings.designation && <p className="warning-message">{warnings.fullname}</p>}
        <br /><br />
        <label>Department</label>
        <input
          type="text"
          name="department"
          placeholder="Department"
          className="input-field"
          value={addEmployee.department}
          onChange={onInputChange}
        />
        {warnings.department && <p className="warning-message">{warnings.fullname}</p>}
        <br /><br />
        
        

        {error && <p className="error-message">{error}</p>}

        <div className="button-group">
          <button className="cancel">Cancel</button>
          <button className="add" onClick={addEmployeeHandler}>
            Add
          </button>
        </div>
      </div>
      </div>
  );
};

export default AddEmployees;   
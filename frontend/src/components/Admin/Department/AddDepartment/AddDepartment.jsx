import React, { useState } from "react";
import './AddDepartment.css';
import Departments from "../Departments/Departments";

const adddepartmentInitialValue = {
    department: ''
};

const AddDepartment =  () => {
  const [addDepartment, setAddDepartment] = useState(adddepartmentInitialValue);
  const [error, setError] = useState('');
  const [ warnings, setWarnings] = useState({});

const adddepartment = async () => {
    if(Object.values(addDepartment).some((value) => value.trim() === '')) {
        setError('Please fill in the fields.');
        return;
    }
    
    if(Object.keys(warnings).length > 0) {
        setError('Please resolve all validation warnings.');
        return;
    }

    const extraFields = Object.keys(addDepartment).filter(
        (key) => !(key in adddepartmentInitialValue)    
    );

    if(extraFields.length > 0) {
        setError('Invalid fields detected. Please refresh and try again.');
        return;
    }

    const token = localStorage.getItem('token');
    if(!token) {
        console.log('No token found');
        return;
    }

    const formData = { ...addDepartment};

    try {
      const response = await fetch('http://localhost:3000/departments' , {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if(!response.ok) {
        throw new Error(data.message || 'Failed to add department');
      }

      setAddDepartment(adddepartmentInitialValue);
      setError('');
      alert('Department added successfully');
    } catch(error) {
        setError('There was an error submitting the form. Please try again.');
    }
};

const validateFields = (field,value) => {
    const newWarnings = {...warnings};

    if(field === 'department') {
        if(value.trim() === '') {
            newWarnings.department = 'Department is required';
        } else {
            delete newWarnings.department;
        }
    }

    setWarnings(newWarnings);
};

const OnInputChange = (e) => {
    const { name, value} = e.target;
    console.log(`Input Change - ${name}: ${value}`);
    setAddDepartment((prevState) => ({
        ...prevState,
        [name]: value,
    }));
    validateFields(name, value);
};

return (
  <div className="auth-container">
    <div className="flex-container">
        <div className="form-container">
            <h2>Add Department</h2>
            <label>Department</label>
            <input 
            type="text"
            name="department"
            className="input-field"
            value={addDepartment.department}
            onChange={OnInputChange}
            />
            {warnings.department && <p className="warning-message">{warnings.department}</p>}

            {error && <p className="error-message">{error}</p>}
        
        <div className="button-group">
            <button className="cancel">Cancel</button>
            <button className="add" onClick={adddepartment}>Add</button>
        </div>
        </div>
        <Departments />
    </div>
  </div>
);
};

export default AddDepartment;
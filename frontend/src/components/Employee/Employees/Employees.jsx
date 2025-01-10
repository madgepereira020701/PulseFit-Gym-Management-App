import React, { useState, useEffect} from 'react';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [updatedDetails, setUpdatedDetails] = useState({
    emno: '',
    emphno: '',
  });


  // Fetch employees data on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }
    
      try {
        const response = await fetch('http://localhost:3000/employees', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        const data = await response.json();
        console.log('Fetched Employees:', data); // Log entire response
    
        if (response.ok) {
          setEmployees(data.employees || []);
        } else {
          throw new Error(data.message || 'Failed to fetch employees');
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setUpdatedDetails({
      email: employee.email,
      emno: employee.emno,
      emphno: employee.emphno,
    });
  };

 
  


  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateEmployee = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/employees/${updatedDetails.email}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDetails),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update employee');
      }

      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.email === updatedDetails.email ? { ...employee, ...updatedDetails } : employee
        )
      );

      setEditingEmployee(null);
      alert('Employee details updated successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setUpdatedDetails({ emno: '', emphno: '' });
  };

  const handleDeleteEmployee = async (emno) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/employees/${emno}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete employee');
      }

      setEmployees((prev) => prev.filter((employee) => employee.emno !== emno));
      alert('Employee deleted successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  

  return (
    <div className="table-container">
      {loading ? (
        <p>Loading employees...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <h2>Employees List</h2>

      

          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Date Of Join</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.emno}>
                  <td>{employee.emno}</td>
                  <td>{employee.fullname}</td>
                  <td>{employee.email}</td>
                  <td>{employee.emphno}</td>
                  <td>{employee.doj}</td>
                  <td>{employee.designation}</td>
                  <td>{employee.department}</td>
                  <td>
                    <button className="embutton" onClick={() => handleEdit(employee)}>Edit</button>
                    <button className="embutton" onClick={() => handleDeleteEmployee(employee.emno)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editingEmployee && (
            <div className="edit-form">
              <h3>Edit Employee</h3>
              <label>Employee Number:</label>
              <input
                type="text"
                name="emno"
                className="input-field"
                value={updatedDetails.emno}
                onChange={handleUpdateChange}
              />
              <label>Phone Number:</label>
              <input
                type="text"
                name="emphno"
                className="input-field"
                value={updatedDetails.emphno}
                onChange={handleUpdateChange}
              />
              <div className="button-group">
                <button onClick={handleUpdateEmployee} className="add">Update</button>
                <button onClick={handleCancelEdit} className="cancel">Cancel</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Employees;

import React, { useState, useEffect } from 'react';
import './Employees.css';
import '../../../../../node_modules/datatables.net-dt/css/dataTables.dataTables.css';
import $ from 'jquery';
import 'datatables.net';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [updatedDetails, setUpdatedDetails] = useState({
    fullname:'', emphno:'',  designation:'', department:'', doj:'',
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

  // Initialize DataTables after data is fetched
  // Initialize DataTables after data is fetched
  useEffect(() => {
    if (employees.length > 0) {
      // Destroy the existing DataTable instance if it already exists
      if ($.fn.DataTable.isDataTable('#employeeTable')) {
        $('#employeeTable').DataTable().destroy();
      }
  
      // Initialize DataTable with custom toolbar
      $('#employeeTable').DataTable({
        dom: '<"dt-toolbar">rt<"bottom bottom-info"ip>', // Correct layout for pagination and info
        initComplete: function () {
          // Add custom toolbar HTML
          $('.dt-toolbar').html(`
            <div class="dt-layout-row">
              <div class="dt-layout-cell dt-layout-start">
                <div class="dt-length">
                  Entries per page:
                  <select aria-controls="employeeTable" class="dt-input" id="dt-length">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
              <div class="dt-layout-cell dt-layout-end">
                <div class="dt-search">
                  Search:
                  <input type="search" class="dt-input" id="dt-search" placeholder="Search..." aria-controls="employeeTable">
                </div>
              </div>
            </div>
          `);
  
          // Move DataTable info and pagination to the correct container
          const info = $('#employeeTable_info').detach();
          $('.bottom-info').prepend(info);
  
          // Dynamically add CSS for styling
          const styles = `
            <style>
              .dt-paging {
                display: flex !important;
                justify-content: flex-start !important; /* Align buttons to the left */
                flex-wrap: nowrap !important; /* Prevent buttons from wrapping */
                align-items: center !important; /* Vertically align buttons */
                white-space: nowrap !important; /* Prevent wrapping inside buttons */
              }
  
              .dt-paging-button {
                display: inline-flex !important; /* Ensure buttons stay inline */
                align-items: center !important; /* Vertically center button text */
                margin: 0 !important; /* Remove default margin */
                background-color: #f9f9f9 !important; /* Optional: Button background */
                cursor: pointer !important; /* Pointer cursor for better UX */
                width: 30px;
              }
  
              .dt-toolbar {
                margin-bottom: 10px !important; /* Add spacing below toolbar */
              }

              .dt-paging{
              margin-top: 10px;}
             
  
              .bottom-info {
                display: flex !important;
                justify-content: space-between !important; /* Spread content across the row */
                flex-wrap: nowrap !important; /* Prevent wrapping */
                align-items: center !important; /* Vertically align the content */
              }
  
              .dt-info {
                margin-right: 10px !important; /* Space between info and pagination */
              }
            </style>
          `;
  
          // Append the style to the head
          $('head').append(styles);
  
          // Add event listener to handle "entries per page" change
          $('#dt-length').on('change', function () {
            $('#employeeTable').DataTable().page.len($(this).val()).draw();
          });
  
          // Add event listener for the search box functionality
          $('#dt-search').on('input', function () {
            $('#employeeTable').DataTable().search($(this).val()).draw();
          });
        },
      });
    }
  }, [employees]);
  

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setUpdatedDetails({
      fullname: employee.fullname,
      email: employee.email,
      emphno: employee.emphno,
      doj: employee.doj,
      designation: employee.designation,
      department: employee.department

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
    setUpdatedDetails({    fullname:'', emphno:'',  designation:'', department:'', doj:''    });
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
    <div className="table-employees-container">
      {loading ? (
        <p>Loading employees...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <h2>Employees List</h2>
          <div className="employee-table-wrapper">
          <table id="employeeTable" className="employee-table">
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
                  <td className='actions'>
                    <button className="embutton" onClick={() => handleEdit(employee)}>Edit</button>
                    <button className="embutton" onClick={() => handleDeleteEmployee(employee.emno)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {editingEmployee && (
            <div className="edit-form">
              <h3>Edit Employee</h3>
              <label>Full Name:</label>
              <input
                type="text"
                name="fullname"
                className="input-field"
                value={updatedDetails.fullname}
                onChange={handleUpdateChange}
              />
              <label>Phone Number:</label>
              <input
                type="number"
                name="emphno"
                className="input-field"
                value={updatedDetails.emphno}
                onChange={handleUpdateChange}
              />
               <label>Designation:</label>
              <input
                type="text"
                name="designation"
                className="input-field"
                value={updatedDetails.designation}
                onChange={handleUpdateChange}
              />
               <label>Department:</label>
              <input
                type="text"
                name="department"
                className="input-field"
                value={updatedDetails.department}
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

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeDetails.css';

const EmployeeDetails = () => {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch member details on component mount
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      const token = localStorage.getItem('token');  // Get token from localStorage
      if (!token) {
        setError('No token found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/details2', {
          headers: {
            Authorization: `Bearer ${token}`,  // Add token in Authorization header
          },
        });

        const data = await response.json();
        if (response.ok) {
          setEmployeeDetails(data.employeeDetails[0]); // Access the first item in the array
        } else {
          throw new Error(data.message || 'Failed to fetch member details');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, []);





  if (loading) {
    return <div>Loading...</div>;
  }

  if (!localStorage.getItem('token')) {
    navigate('/some-route'); // Example of using navigate
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {employeeDetails && (
        <div className="details-container">
          <h2>Employee Details</h2>
          <br />
          <div className="details-row">
            <p><strong>Full Name:</strong></p>
            <span>{employeeDetails.fullname}</span>
          </div>
          {/* <br /> */}
          <div className="details-row">
            <p><strong>Employee ID:</strong></p>
            <span>{employeeDetails.emno}</span>
          </div>
          {/* <br /> */}
          <div className="details-row">
            <p><strong>Phone Number:</strong></p>
            <span>{employeeDetails.emphno}</span>
          </div>
          {/* <br /> */}
          <div className="details-row">
            <p><strong>Email:</strong></p>
            <span>{employeeDetails.email}</span>
          </div>
          <div className="details-row">
            <p><strong>Date Of Join:</strong></p>
            <span>{employeeDetails.doj}</span>
          </div>
          <div className="details-row">
            <p><strong>Designation:</strong></p>
            <span>{employeeDetails.designation}</span>
          </div>
          <div className="details-row">
            <p><strong>Department:</strong></p>
            <span>{employeeDetails.department}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;

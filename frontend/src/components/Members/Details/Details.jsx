import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Details.css';

const Details = () => {
  const [memberDetails, setMemberDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch member details on component mount
  useEffect(() => {
    const fetchMemberDetails = async () => {
      const token = localStorage.getItem('token');  // Get token from localStorage
      if (!token) {
        setError('No token found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/memberdetails', {
          headers: {
            Authorization: `Bearer ${token}`,  // Add token in Authorization header
          },
        });

        const data = await response.json();
        if (response.ok) {
          setMemberDetails(data.memberDetails[0]); // Access the first item in the array
        } else {
          throw new Error(data.message || 'Failed to fetch member details');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
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
      {memberDetails && (
        <div className="details-container">
          <h2>Member Details</h2>
          <br />
          <div className="details-row">
            <p><strong>Full Name:</strong></p>
            <span>{memberDetails.fullname}</span>
          </div>
          <br />
          <div className="details-row">
            <p><strong>Member Number:</strong></p>
            <span>{memberDetails.memno}</span>
          </div>
          <br />
          <div className="details-row">
            <p><strong>Phone Number:</strong></p>
            <span>{memberDetails.memphno}</span>
          </div>
          <br />
          <div className="details-row">
            <p><strong>Email:</strong></p>
            <span>{memberDetails.email}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Details;


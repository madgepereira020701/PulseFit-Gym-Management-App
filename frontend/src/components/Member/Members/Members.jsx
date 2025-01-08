import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Members.css';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null);
  const [updatedDetails, setUpdatedDetails] = useState({
    email: '',
    memno: '',
    memphno: '',
    doj: '',
    doe: ''
  });

  const navigate = useNavigate();

  // Fetch members data on component mount
  useEffect(() => {
    const fetchMembers = async () => {
      const token = localStorage.getItem('token');  // Get token from localStorage
      if (!token) {
        console.log('No token found');
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/members', {
          headers: {
            Authorization: `Bearer ${token}`,  // Add token in Authorization header
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMembers(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch members');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleNavigation = (route) => {
    navigate(route);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setUpdatedDetails({
      email: member.email,
      memno: member.memno,
      memphno: member.memphno,
      doj: member.doj,
      doe: member.doe
    });
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDetails({ ...updatedDetails, [name]: value });
  };

  const handleUpdateMember = async () => {
    const token = localStorage.getItem('token');  // Get token from localStorage
    if (!token) {
      console.log('No token found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/members/${updatedDetails.email}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDetails),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update member');
      }

      // Update the member in the state after successful update
      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.email === updatedDetails.email ? { ...member, ...updatedDetails } : member
        )
      );

      setEditingMember(null);
      setError(null);

      alert('Member details updated successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setUpdatedDetails({
      email: '',
      memno: '',
      memphno: '',
      doj: '',
      doe: ''
    });
  };

  const handleDeleteMember = async (memno) => {
    const token = localStorage.getItem('token');  // Get token from localStorage
    if (!token) {
      console.log('No token found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/members/${memno}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete member');
      }

      setMembers(members.filter((member) => member.memno !== memno));
      alert('Member deleted successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  // Navigate to View Payments for the selected member
  const handleViewPayments = (memno) => {
    navigate(`/payments/${memno}`);
  };

  return (
    <div className="table-container">
      {loading ? (
        <p>Loading members...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <h2>Members List</h2>
          <table className="member-table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.memno}>
                  <td>{member.memno}</td>
                  <td>{member.fullname}</td>
                  <td>{member.email}</td>
                  <td>{member.memphno}</td>
                  <td>
                    <button onClick={() => handleViewPayments(member.memno)}>View Payments</button>
                  </td>
                  <td className="actions">
                    <button onClick={() => handleEdit(member)}>Edit</button>
                    <button onClick={() => handleDeleteMember(member.memno)}>Delete</button>
                    <button onClick={() => handleNavigation(`/addrenewals/${member.memno}`)}>Renew</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editingMember && (
            <div className="edit-form">
              <h3>Edit Member</h3>
              <label>Member Number:</label>
              <input
                type="text"
                name="memno"
                className="input-field"
                value={updatedDetails.memno}
                onChange={handleUpdateChange}
                // readOnly
              />

              <label>Phone Number:</label>
              <input
                type="text"
                name="memphno"
                className="input-field"
                value={updatedDetails.memphno}
                onChange={handleUpdateChange}
              />

              <label>Date of Joining:</label>
              <input
                type="date"
                name="doj"
                className="input-field"
                value={updatedDetails.doj}
                onChange={handleUpdateChange}
              />

              <label>Date of End:</label>
              <input
                type="date"
                name="doe"
                className="input-field"
                value={updatedDetails.doe}
                onChange={handleUpdateChange}
              />

              {error && <p className="error-message">{error}</p>}

              <div className="button-group">
                <button onClick={handleUpdateMember} className="add">Update</button>
                <button onClick={handleCancelEdit} className="cancel">Cancel</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Members;

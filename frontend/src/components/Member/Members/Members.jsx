import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../../node_modules/datatables.net-dt/css/dataTables.dataTables.css';
import $ from 'jquery';
import 'datatables.net';
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

  useEffect(() => {
    if (members.length > 0) {
      // Destroy the existing DataTable instance if it already exists
      if ($.fn.DataTable.isDataTable('#memberTable')) {
        $('#memberTable').DataTable().destroy();
      }
  
      // Initialize DataTable with custom toolbar
      $('#memberTable').DataTable({
        dom: '<"dt-toolbar">rt<"bottom bottom-info"ip>', // Correct layout for pagination and info
        initComplete: function () {
          // Add custom toolbar HTML
          $('.dt-toolbar').html(`
            <div class="dt-layout-row">
              <div class="dt-layout-cell dt-layout-start">
                <div class="dt-length">
                  Entries per page:
                  <select aria-controls="memberTable" class="dt-input" id="dt-length">
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
                  <input type="search" class="dt-input" id="dt-search" placeholder="Search..." aria-controls="memberTable">
                </div>
              </div>
            </div>
          `);
  
          // Move DataTable info and pagination to the correct container
          const info = $('#memberTable_info').detach();
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
            $('#memberTable').DataTable().page.len($(this).val()).draw();
          });
  
          // Add event listener for the search box functionality
          $('#dt-search').on('input', function () {
            $('#memberTable').DataTable().search($(this).val()).draw();
          });
        },
      });
    }
  }, [members]);

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
    <div className="table-members-container">
  {loading ? (
    <p>Loading members...</p>
  ) : error ? (
    <p className="error-message">{error}</p>
  ) : (
    <>
      <h2>Members List</h2>
      <div className="member-table-wrapper">
      <table className="member-table" id="memberTable">
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
      </div>

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

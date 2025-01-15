import React, { useState, useEffect } from 'react';
import '../../../../node_modules/datatables.net-dt/css/dataTables.dataTables.css';
import $ from 'jquery';
import 'datatables.net';
import './Attendance.css';

const Attendance = () => {
  const [attendances, setAttendance] = useState([]); // Default to an empty array
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch attendance data on component mount
  useEffect(() => {
    const fetchAttendances = async () => {
        const token = localStorage.getItem('token');  // Get token from localStorage
        if (!token) {
          console.log('No token found');
          return;
        }
        try {
          const response = await fetch('http://localhost:3000/attendance', {
            headers: {
              Authorization: `Bearer ${token}`,  // Add token in Authorization header
            },
          });
          const data = await response.json();
          if (response.ok) {
            setAttendance(Array.isArray(data.attendance) ? data.attendance : []); // Ensure it's an array
          } else {
            throw new Error(data.message || 'Failed to fetch attendance');
          }
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      

    fetchAttendances();
  }, []);

  useEffect(() => {
    if (attendances.length > 0) {
      // Destroy the existing DataTable instance if it already exists
      if ($.fn.DataTable.isDataTable('#attendanceTable')) {
        $('#attendanceTable').DataTable().destroy();
      }

      // Initialize DataTable with custom toolbar
      $('#attendanceTable').DataTable({
        dom: '<"dt-toolbar">rt<"bottom bottom-info"ip>', // Correct layout for pagination and info
        initComplete: function () {
          // Add custom toolbar HTML
          $('.dt-toolbar').html(`
            <div class="dt-layout-row">
              <div class="dt-layout-cell dt-layout-start">
                <div class="dt-length">
                  Entries per page:
                  <select aria-controls="attendanceTable" class="dt-input" id="dt-length">
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
                  <input type="search" class="dt-input" id="dt-search" placeholder="Search..." aria-controls="attendanceTable">
                </div>
              </div>
            </div>
          `);

          // Move DataTable info and pagination to the correct container
          const info = $('#attendanceTable_info').detach();
          $('.bottom-info').prepend(info);

          // Dynamically add CSS for styling
          const styles = `
            <style>
              .dt-paging {
                display: flex !important;
                justify-content: flex-start !important;
                flex-wrap: nowrap !important;
                align-items: center !important;
                white-space: nowrap !important;
              }

              .dt-paging-button {
                display: inline-flex !important;
                align-items: center !important;
                margin: 0 !important;
                background-color: #f9f9f9 !important;
                cursor: pointer !important;
                width: 30px;
              }

              .dt-toolbar {
                margin-bottom: 10px !important;
              }

              .bottom-info {
                display: flex !important;
                justify-content: space-between !important;
                flex-wrap: nowrap !important;
                align-items: center !important;
              }

              .dt-info {
                margin-right: 10px !important;
              }
            </style>
          `;
  
          // Append the style to the head
          $('head').append(styles);
  
          // Add event listener to handle "entries per page" change
          $('#dt-length').on('change', function () {
            $('#attendanceTable').DataTable().page.len($(this).val()).draw();
          });
  
          // Add event listener for the search box functionality
          $('#dt-search').on('input', function () {
            $('#attendanceTable').DataTable().search($(this).val()).draw();
          });
        },
      });
    }
  }, [attendances]);

  return (
    <div className="table-attendance-container">
      {loading ? (
        <p>Loading attendance...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <h2>Attendance List</h2>
          <div className="attendance-table-wrapper">
            <table className="attendance-table" id="attendanceTable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Id</th>
                  <th>Type</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                </tr>
              </thead>
              <tbody>
                {attendances.length > 0 ? (
                  attendances.map((attendance) => (
                    <tr key={attendance._id}>
                      <td>{attendance.date}</td>
                      <td>{attendance.user_id}</td>
                      <td>{attendance.user_type}</td>
                      <td>{attendance.in_time}</td>
                      <td>{attendance.out_time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No attendance records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;

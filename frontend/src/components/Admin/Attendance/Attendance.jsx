import React, { useState, useEffect } from 'react';
import '../../../../node_modules/datatables.net-dt/css/dataTables.dataTables.css';
import $ from 'jquery';
import 'datatables.net';
import './Attendance.css';

const Attendance = () => {
  const [attendances, setAttendance] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const fetchAttendances = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/attendance', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setAttendance(Array.isArray(data.attendance) ? data.attendance : []);
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
      if ($.fn.DataTable.isDataTable('#attendanceTable')) {
        $('#attendanceTable').DataTable().destroy();
      }

      // Initialize DataTable with all records, but filter today's records by default
      $('#attendanceTable').DataTable({
        dom: '<"dt-toolbar">rt<"bottom bottom-info"ip>',
        initComplete: function () {
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
              <div class="dt-layout-cell dt-layout-center">
                <div class="dt-search">
                  Search:
                  <input type="search" class="dt-input" id="dt-search" placeholder="Search..." aria-controls="attendanceTable">
                </div>
              </div>
              <div class="dt-layout-cell dt-layout-end">
                <div class="dt-search">
                  Search by Date:
                  <input type="date" class="dt-input" id="dt-date-search" aria-controls="attendanceTable">
                </div>
              </div>
            </div>
          `);

          const info = $('#attendanceTable_info').detach();
          $('.bottom-info').prepend(info);

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

              .dt-layout-center {
                margin-left: 140px;
              }

              .dt-layout-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
              }
            </style>
          `;
          $('head').append(styles);

          // Handle "entries per page" change
          $('#dt-length').on('change', function () {
            $('#attendanceTable').DataTable().page.len($(this).val()).draw();
          });

          // Handle general search functionality
          $('#dt-search').on('input', function () {
            $('#attendanceTable').DataTable().search($(this).val()).draw();
          });

          // Handle date search functionality
          $('#dt-date-search').on('change', function () {
            const searchValue = $(this).val(); // Input value will already be in YYYY-MM-DD format
            $('#attendanceTable').DataTable().column(0).search(searchValue).draw();
          });
        },

        // Initially filter by today's date if it matches any row
        rowCallback: function (row, data) {
          const todayDate = getTodayDate();
          if (data[0] !== todayDate) {
            // Allow all records, don't hide any rows
            $(row).show();
          }
        },
      });

      // Trigger search for today's date by default
      $('#dt-date-search').val(getTodayDate()).trigger('change');
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
                  <th>Full Name</th>
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
                      <td>{attendance.fullname}</td>
                      <td>{attendance.in_time}</td>
                      <td>{attendance.out_time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No attendance records found.</td>
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

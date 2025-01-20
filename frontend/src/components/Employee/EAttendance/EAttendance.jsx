import React , { useState, useEffect } from 'react';
import '../../../../node_modules/datatables.net-dt/css/dataTables.dataTables.css';
import $ from 'jquery';
import './EAttendance.css';

const EAttendance = () => {
    const [ attendances, setAttendance] = useState([]);
    const [ error, setError ] = useState('');
    const [ loading, setLoading ] = useState(true);

    const getTodayDate = () => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2,'0');
        const mm = String(today.getMonth() + 1).padStart(2,'0');
        const yyyy = today.getFullYear();
        return `${yyyy}-${mm}-${dd}`;
    };

    useEffect(() => {
        const fetchAttendances = async () => {
            const token = localStorage.getItem('token');
            if(!token){
                console.log('Token not found');
                return;
            }
            try {
                const response = await fetch('http://localhost:3000/employeeattendance', {
                    headers:{
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if(response.ok){
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
        if(attendances.length > 0) {
            if($.fn.DataTable.isDataTable('#attendanceTable')) {
                $('#attendanceTable').DataTable().destroy();
            }

            $('#attendanceTable').DataTable({
                dom: '<"dt-toolbar">rt<"bottom bottom-info"ip>',
                initComplete: function () {
                    $('.dt-toolbar').html(`
                        <div class="dt-layout-row">
                          <div class="dt-layout-cell dt-layout-start">
                            <div class="dt-length">
                              Entries per page:
                              <select aria-controls="attendanceTable" class="dt-input" id="dt-length">
                                <option value="5">5</option>
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
                       wifth: 30px;
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

                        .dt-info{
                         margin-right: 10px !important;
                        }

                        .dt-layout-center {
                          margin-left: 140px;
                        }

                        .dt-layout-row{
                          display: flex;
                          align-items: center;
                          justify-content: space-between;
                        }
                      </style>`;
                      $('head').append(styles);

                      $('#dt-length').on('change', function () {
                        $('#attendanceTable').DataTable().page.len($(this).val()).draw();
                      });

                      $('#dt-search').on('input', function(){
                       $('#attendanceTable').DataTable().search($(this).val()).draw();
                      });
                     
                      $('#dt-date-search').on('change', function () {
                        const searchValue = $(this).val();
                        $('#attendanceTable').DataTable().column(0).search(searchValue).draw();
                      });
                }, 

                rowCallback: function (row, data) {
                    const todayDate = getTodayDate();
                    if ( data[0] !== todayDate) {
                        $(row).show();
                    }
                },
            });

            $('#dt-date-search').val(getTodayDate()).trigger('change');
        }
    }, [ attendances ]);

     return(<div className="table-attendance-container">
      {loading ? (
        <p>Loading attendance...</p>
      ) : error ? (
        <p className='error-message'>{error}</p>
      ) : (
        <>
        <div className="attendance-table-wrapper">
            <table className="attendance-table" id="attendanceTable">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                    </tr>
                </thead>

                    <tbody>
                        {attendances.length > 0 ? (
                        attendances.map((attendance) => (
                         <tr key={attendance._id}>
                            <td>{attendance.date}</td>
                            <td>{attendance.in_time}</td>
                            <td>{attendance.out_time}</td>
                         </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No attendance records found</td>
                        </tr>
                    )}
                    </tbody>
            </table>
        </div>
        </>
      )}
     </div>
     );
}
export default EAttendance;
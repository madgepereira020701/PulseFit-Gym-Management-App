import React, { useState, useEffect } from 'react';
import '../../../../node_modules/datatables.net-dt/css/dataTables.dataTables.css';
import $ from 'jquery';
import 'datatables.net';
import './ViewPayments.css';

const ViewPayments1 = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');

  // Fetch payments data on component mount
  useEffect(() => {
    const fetchPayments = async () => {


      const token = localStorage.getItem('token');  // Get token from localStorage
      if (!token) {
        console.log('No token found');
        return;
      }
     
      try {
        const response = await fetch(`http://localhost:3000/payments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,  // Add token in Authorization header
            },
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }
        const data = await response.json();
        setPayments([data.data]); // Set the payment data array based on the response
      } catch (err) {
        setError(err.message);
      }
    };

      fetchPayments();
    
  }, []);


  useEffect(() => {
    if(payments.length > 0) {
      if($.fn.DataTable.isDataTable('#paymentsTable')) {
       $('#paymentsTable').DataTable().destroy();
      }
      $('#paymentsTable').DataTable({
        dom: '<"dt-toolbar">rt<"bottom bottom-info"ip>',
        initComplete: function () {
          $('.dt-toolbar').html(`
            <div class="dt-layout-row">
              <div class="dt-layout-cell dt-layout-start">
                <div class="dt-length">
                  Entries per page: 
                  <select aria-controls="paymentsTable" class="dt-input" id="dt-length">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  <select>
                </div>
              </div>
              <div class="dt-layout-cell dt-layout-end">
                <div class="dt-search">
                  Search:
                  <input type="search" class="dt-input" id="dt-search" placeholder="Search..." aria-controls="paymentsTable">
                </div>
              </div>
            </div>
            `);

            const info = $('#paymentsTable_info').detach();
            $('.bottom-info').prepend(info);

            const styles = `
              <style>
              .dt-paging {
                display: flex !important;
                justify-content: flex-start !important;
                flex-warp: nowrap !important;
                align-items: center !important;
                white-space: nowrap !important;
              }
                
              .dt-paging-button {
                diplay: inline-flex !important;
                align-items: center !important;
                margin: 0 !important;
                background-color: #f9f9f9 !important;
                cursor: pointer !important;
                width: 30px;
            
              }
                .dt-toolbar {
                  margin-bottom: 10px !important;
                }
                  
                .dt-paging {
                margin-top: 10px;}

                .bottom-info {
                  display: flex !important;
                  justify-content: space-between !important;
                  flex-wrap: nowrap !important;
                  align-items: center !important;
                }
                
                .dt-info {
                  margin-right: 10px !important;
                }
            </style>`;

            $('head').append(styles);

            $('#dt-length').on('change', function () {
              $('#paymentsTable').DataTable().page.len($(this).val()).draw();
            });

            $('#dt-search').on('input', function () {
              $('#paymentsTable').DataTable().search($(this).val()).draw();
            });
        },
      });
    }
  }, [payments]);

  return (
    <div className="table-container">
      <h2>Payments Details</h2>
      {error && <p className="error-message">{error}</p>}
      {payments.length > 0 && (
        <table className="payments-table" id="paymentsTable">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Price</th>
              <th>Join Date</th>
              <th>End Date</th>
              <th>Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => {
              const allitems = [...(payment.packages || []), ...(payment.renewals || [])]

              return (
                <React.Fragment key={index}>
                  {/* Render main payment info with rowSpan */}
                    { allitems && allitems.map((item, idx) => (
                    <tr key={`${index}-${idx}`}>
                    <td>{item.plan}</td>
                    <td>{item.price}</td>
                    <td>{item.doj || item.dos}</td>
                    <td>{item.doe}</td>
                    <td>{item.paymentdate}</td>
                    </tr>
                    ))}
                 
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewPayments1;

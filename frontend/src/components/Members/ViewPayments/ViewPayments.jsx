import React, { useState, useEffect } from 'react';
import './ViewPayments.css';
import $ from 'jquery';
import '../../../../node_modules/datatables.net-dt/css/dataTables.dataTables.css';

const ViewPayments1 = () => {
  const [payments, setPayments] = useState([]); // Using null initially for clarity
  const [error, setError] = useState('');

  const getCurrentMonth = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2,'0');
    const year = today.getFullYear();
    return `${year}-${month}`;
  }

  useEffect(() => {
    const fetchPayments = async () => {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        console.log('No token found');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/payments', {
          headers: {
            Authorization: `Bearer ${token}`, // Add token in Authorization header
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }

        const data = await response.json();
        setPayments(data.data); // Assuming data.data contains the payment details object
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPayments();
  }, []);

  useEffect(() => {
    if(payments.length > 0) {
       if($.fn.DataTable.isDataTable('#paymentTable')) {
         $('#paymentTable').DataTable().destroy();
       }

       $('#paymentTable').DataTable({
        dom: '<"dt-toolbar">rt<"bottom bottom-info"ip>',
        initComplete: function () {
          $('.dt-toolbar').html(`
            <div className="dt-layout-row">
              <div className="dt-layout-cell dt-layout-start">
                <div className="dt-length">
                  Entries per page:
                  <select aria-controls="paymentTable" class="dt-input" id="dt-length">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
              <div className="dt-layout-cell dt-layout-center">
                <div className="dt-search">
                Search:
                <input className="dt-input" id="dt-search" placeholder="Search..." aria-controls="paymentTable">
                </div>
              </div>
              <div className="dt-layout-cell dt-layout-end">
                <div className="dt-search">
                Search by Month:
                <input type="month" class="dt-input" id="dt-month-search" aria-controls="paymentTable">
                </div>
              </div>
          </div>
            `);

            const info = $('#paymentTable_info').detach();
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
   
              .dt-toolbar{
              margin-bottom: 10px !important;
              }

              .bottom-info{
              display: flex !important;
              justify-content: space-between !important;
              flex-wrap: nowrap !important;
              align-items: center !important;
              }
             
              .dt-info{
              }




            </style>`;

            $('head').append(styles);

            $('#dt-length').on('change', function(){
              $('#paymentTable').DataTable().page.len($(this).val()).draw();
            });

            $('#dt-search').on('input', function() {
              $('#paymentTable').DataTable().search($(this).val()).draw();
            });

            $('#dt-month-search').on('change', function(){
              const searchValue = $(this).val();
              $('#paymentTable').DataTable.column(0).search(searchValue).draw();
            });
        },

        rowCallback: function (row, data) {
          const todayDate = getCurrentMonth();
          const rowDate = data[0];

          const rowMonthYear = rowDate.slice(0, 7);

          if(rowMonthYear !==todayDate)
          {
            $(row).hide();
          }
        },
        order: []
       });
       $('#dt-month-search').val(getCurrentMonth()).trigger('change');
    }
  }, [payments]);
  return (
    <div className="table-container">
      <h2>Payments Details</h2>
      {error && <p className="error-message">{error}</p>}
      {payments ? (
        <table className="payments-table" id="paymentTable">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Price</th>
              <th>Join Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{payments.plan}</td>
              <td>{payments.price}</td>
              <td>{payments.doj}</td>
              <td>{payments.doe}</td>
            </tr>
            {payments.renewals &&
              payments.renewals.map((renewal, idx) => (
                <tr key={idx}>
                  <td>{renewal.plan}</td>
                  <td>{renewal.price}</td>
                  <td>{renewal.dos}</td>
                  <td>{renewal.doe}</td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <p>No payment details found</p>
      )}
    </div>
  );
};

export default ViewPayments1;

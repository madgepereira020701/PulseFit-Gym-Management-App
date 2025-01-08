import React, { useEffect, useState } from "react";
import "./Renewals.css";

const SentEmails = () => {
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('No token found');
      return;
    }
    fetch("http://localhost:3000/renewals",
      {
        headers: {
          Authorization: `Bearer ${token}`,  // Add token in Authorization header
        },
      }
)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "SUCCESS") {
          setEmails(data.data); // Assuming data.data contains the renewal records
        } else {
          setError("Failed to fetch emails");
        }
      })
      .catch((error) => {
        console.error("Error fetching email details:", error);
        setError("Error fetching emails from the server");
      });
  }, []);

  return (
    <div className="table-container">
      <h2>Renewals</h2>
      {error && <div className="error-message">{error}</div>}
      <TableComponent data={emails} />
    </div>
  );
};

const TableComponent = ({ data }) => {
  return (
    <div className="table-container">
      <table className="renewal-table">
        <thead>
          <tr>
            <th>Member ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Plan</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Price</th>
            {/* <th>Total</th> */}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((email, index) => (
              <tr key={index}>
                <td>{email.memno}</td>
                <td>{email.fullname}</td>
                <td>{email.email}</td>
                <td>{email.plan}</td>
                <td>{email.dos}</td>
                <td>{email.doe}</td>
                <td>{email.price}</td>
                {/* <td>{email.totalPrice}</td> */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No renewals to display
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SentEmails;

import React, { useState } from "react";
import './MarkAttendance.css';

const MarkAttendance = () => {
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [error, setError] = useState("");

  const currentDate = new Date().toISOString().split("T")[0]; // e.g., "2025-01-15"

  const token = localStorage.getItem("token"); // Get token from localStorage


  const handleCheckIn = async () => {
    const now = new Date();
    const formattedTime = formatTime(now);
    setCheckInTime(formattedTime);

  

    const formData = {
      date: currentDate,
      in_time: formattedTime,
      out_time: null,
    };

    try {
      const response = await fetch("http://localhost:3000/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to check in.");
      }

      alert(`Checked in at ${formattedTime}`);
      setError("");
    } catch (err) {
      console.error("Error during check-in:", err.message);
      setError(err.message || "There was an error submitting the form. Please try again.");
    }
  };

  const handleCheckOut = async () => {
    const now = new Date();
    const formattedTime = formatTime(now);
    setCheckOutTime(formattedTime);

   

    const formData = {
      date: currentDate,
      in_time: checkInTime,
      out_time: formattedTime,
    };

    try {
      const response = await fetch("http://localhost:3000/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to check out.");
      }

      alert(`Checked out at ${formattedTime}`);
      setError("");
    } catch (err) {
      console.error("Error during check-out:", err.message);
      setError(err.message || "There was an error submitting the form. Please try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Check-In / Check-Out</h1>
      <h2>{currentDate}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ margin: "20px" }}>
        <button
          onClick={handleCheckIn}
          className="check_in"
          onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
        >
          Check In
        </button>
        <br />
        <br />
        <button
          onClick={handleCheckOut}
          className = "check_out"
          onMouseOver={(e) => (e.target.style.backgroundColor = "#f35b56")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#f44336")}
        >
          Check Out
        </button>
      </div>
      <div>
        {checkInTime && <p>Checked In at: {checkInTime}</p>}
        {checkOutTime && <p>Checked Out at: {checkOutTime}</p>}
      </div>
    </div>
  );
};

// Function to format time in hh:mm:ss
const formatTime = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  hours = hours < 10 ? `0${hours}` : hours;
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  seconds = seconds < 10 ? `0${seconds}` : seconds;

  return `${hours}:${minutes}:${seconds}`;
};

export default MarkAttendance;

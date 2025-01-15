import React, { useState } from "react";
import axios from "axios";

const MarkMAttendance = () => {
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);

  // Get current date
  const currentDate = new Date().toLocaleDateString();

  const handleCheckIn = async () => {
    const now = new Date().toLocaleTimeString();
    setCheckInTime(now);

    try {
      const response = await axios.post("http://localhost:3000/attendance", {
        date: currentDate,
        in_time: now,
      });
      alert(`Checked in at ${now}`);
      console.log("Check-in response:", response.data);
    } catch (error) {
      console.error("Error during check-in:", error);
      alert("Failed to check in. Please try again.");
    }
  };

  const handleCheckOut = async () => {
    const now = new Date().toLocaleTimeString();
    setCheckOutTime(now);

    try {
      const response = await axios.post("http://localhost:3000/attendance", {
        date: currentDate,
        out_time: now,
      });
      alert(`Checked out at ${now}`);
      console.log("Check-out response:", response.data);
    } catch (error) {
      console.error("Error during check-out:", error);
      alert("Failed to check out. Please try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Check-In / Check-Out</h1>
      <h2>{currentDate}</h2>
      <div style={{ margin: "20px" }}>
        <button
          onClick={handleCheckIn}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "50px",
            maxWidth: "350px",
          }}
        >
          Check In
        </button>
        <br />
        <br />

        <button
          onClick={handleCheckOut}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            maxWidth: "350px",
          }}
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

export default MarkMAttendance;

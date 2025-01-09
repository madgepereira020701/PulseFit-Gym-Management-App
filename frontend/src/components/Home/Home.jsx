import React, { useState, useEffect }from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './Home.css'; // Add your CSS file for styling

const Home = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [role, setRole] = useState(''); // Track user role


  const handleClick = () => {
    navigate('/members'); // Redirect to the Members page when button is clicked
  };


  useEffect(() => {
    const storedUserRole = localStorage.getItem('role');
    if (storedUserRole) {
      setRole(storedUserRole);
    }
  }, []);
  
  return (
    <div className="home">
      <div className="home-overlay">
        <h1>Welcome to PulseFit</h1>
        {role === 'Admin' ? (
          <p>Your one-stop solution for managing memberships and renewals.</p>
        ) : role === 'Member' ? (
          <p>As a member, you have access to your details, view your payments, and calendar.</p>
        ) : role === 'Employee' ? (
          <p>As an employee, you have access to your details and calendar.</p>
        ) : null}
        
        <button className="home-button" onClick={handleClick}>
          Get Started
        </button>
      </div>
      <img src="/gym.png" alt="Gym Room" className="home-image" />
    </div>
  );
};

export default Home;

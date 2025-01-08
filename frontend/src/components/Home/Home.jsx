import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './Home.css'; // Add your CSS file for styling

const Home = () => {
  const navigate = useNavigate(); // Initialize navigate function

  const handleClick = () => {
    navigate('/members'); // Redirect to the Members page when button is clicked
  };

  return (
    <div className="home">
      <div className="home-overlay">
        <h1>Welcome to PulseFit</h1>
        <p>Your one-stop solution for managing memberships and renewals.</p>
        <button className="home-button" onClick={handleClick}>
          Get Started
        </button>
      </div>
      <img src="/gym.png" alt="Gym Room" className="home-image" />
    </div>
  );
};

export default Home;

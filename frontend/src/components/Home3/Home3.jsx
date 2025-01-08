import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './Home3.css'; // Add your CSS file for styling

const Home3 = () => {
  const navigate = useNavigate(); // Initialize navigate function

  const handleClick = () => {
    console.log('Fetch details');
    navigate('/employeedetails'); // Redirect to the Members page when button is clicked
  };

  return (
    <div className="home">
      <div className="home-overlay">
      <h1>Welcome to PulseFit</h1>
<p>As a employee, you have access your details and calendar</p>

        <button className="home-button" onClick={handleClick}>
          Get Started
        </button>
      </div>
      <img src="/gym.png" alt="Gym Room" className="home-image" />
    </div>
  );
};

export default Home3;

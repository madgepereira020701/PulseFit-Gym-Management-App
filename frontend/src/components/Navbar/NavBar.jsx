import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import { FaBars } from 'react-icons/fa6';
import { FaAngleDown } from 'react-icons/fa';
import { FaHeartbeat } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [userinitials, setUserInitials] = useState('');
  const [isOthersDropDownOpen, setIsOthersDropDownOpen] = useState(false);
  const [role, setRole] = useState(''); // Track user role

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const storedUserRole = localStorage.getItem('role'); // Retrieve role from localStorage
  
    if (storedUserName) {
      const initials = storedUserName.split(' ').map((word) => word[0]).join('');
      setUserInitials(initials.toUpperCase());
      //setUser(storedUserName);
    }
    if (storedUserRole) {
      setRole(storedUserRole); // Set role correctly
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropDown = () => {
    setIsDropDownOpen(!isDropDownOpen);
  };

  const toggleOthersDropDown = () => {
    setIsOthersDropDownOpen(!isOthersDropDownOpen);
  };

  const logout = () => {
    localStorage.removeItem('token'); // Remove token on logout
    localStorage.removeItem('userName'); // Remove user data on logout
    localStorage.removeItem('role'); // Remove role data on logout
    window.location.href = '/'; // Redirect to login page
  };

  const deleteaccount = async () => {
    const userName = localStorage.getItem('userName'); // Get the logged-in user's email from localStorage
    const token = localStorage.getItem('token'); // Get token from localStorage
  
    console.log('Name:', userName);  // Check the email value
    console.log('Token:', token);  // Check the token value
  
    if (!token || !userName) {
      console.log('No token or email found');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3000/api/${userName}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }
  
      localStorage.removeItem('token'); // Remove token
      localStorage.removeItem('userName'); // Remove username
      localStorage.removeItem('role'); // Remove role
  
      alert('Your account has been deleted successfully.');
  
      window.location.href = '/'; // Redirect to the login page
  
    } catch (error) {
      console.error('Error deleting account:', error.message);
      alert('Error deleting account. Please try again.');
    }
  };
  

  return (
    <nav className="nav">
      <div className="company-title">
        <h2>
          <FaHeartbeat style={{ color: 'red', marginRight: '8px' }} /> PulseFit
        </h2>
      </div>
      <ul className={isOpen ? 'nav-links active' : 'nav-links'}>
      {role === 'Admin' ? (
    <>
      <li><NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
      <li><NavLink to="/attendance" className={({ isActive }) => isActive ? 'active' : ''}>Attendance</NavLink></li>
      <li><NavLink to="/members" className={({ isActive }) => isActive ? 'active' : ''}>Add Members</NavLink></li>
      <li><NavLink to="/viewmembers" className={({ isActive }) => isActive ? 'active' : ''}>Members</NavLink></li>
      <li><NavLink to="/employees" className={({ isActive }) => isActive ? 'active' : ''}>Add Employees</NavLink></li>
      <li><NavLink to="/viewemployees" className={({ isActive }) => isActive ? 'active' : ''}>Employees</NavLink></li>
      <li><NavLink to="/calendar" className={({ isActive }) => isActive ? 'active' : ''}>Calendar</NavLink></li>
      <li><NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>Settings</NavLink></li>
      <li className='account' onClick={toggleOthersDropDown}>
        Others <FaAngleDown />
        {isOthersDropDownOpen && (
          <ul className="othersdropdown active : othersdropdown">
            <div className="others-dropdown-container">
            <li><NavLink to="/addplans" className={({ isActive }) => isActive ? 'active' : ''}>Package</NavLink></li>
            <li><NavLink to="/adddepartments" className={({ isActive }) => isActive ? 'active' : ''}>Department</NavLink></li>
            </div>
          </ul>
        )}
      </li>
    </>
  ) : role === 'Member' ? (
    <>
      <li><NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
      <li><NavLink to="/details" className={({ isActive }) => isActive ? 'active' : ''}>Details</NavLink></li>
      <li><NavLink to="/check" className={({ isActive }) => isActive ? 'active' : ''}>Mark Attendance</NavLink></li>
      <li><NavLink to="/memberattendance" className={({ isActive }) => isActive ? 'active' : ''}>Attendance</NavLink></li>
      <li><NavLink to="/viewpayments" className={({ isActive }) => isActive ? 'active' : ''}>View Payments</NavLink></li>
      <li><NavLink to="/memcalendar" className={({ isActive }) => isActive ? 'active' : ''}>Calendar</NavLink></li>
    </>
  ) : role === 'Employee' ? (
    <>
      <li><NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
      <li><NavLink to="/employeedetails" className={({ isActive }) => isActive ? 'active' : ''}>Details</NavLink></li>
      <li><NavLink to="/employeeattendance" className={({ isActive }) => isActive ? 'active' : ''}>Attendance</NavLink></li>
      <li><NavLink to="/check" className={({ isActive }) => isActive ? 'active' : ''}>Mark Attendance</NavLink></li>
      <li><NavLink to="/emcalendar" className={({ isActive }) => isActive ? 'active' : ''}>Calendar</NavLink></li>
    </>
  ) : null}
        <li className="account" onClick={toggleDropDown}>
          {userinitials ? userinitials : 'Guest'} <FaAngleDown />
          {isDropDownOpen && (
            <ul className="dropdown active : dropdown">
              <li><NavLink onClick={logout} className={({ isActive }) => isActive ? 'active' : ''}>Log out</NavLink></li>
              <li><NavLink onClick={deleteaccount} className={({ isActive }) => isActive ? 'active' : ''}>Delete Account</NavLink></li>
            </ul>
          )}
        </li>
      </ul>
      <div className="icon" onClick={toggleMenu}>
        <FaBars />
      </div>
    </nav>
  );
};

export default Navbar;

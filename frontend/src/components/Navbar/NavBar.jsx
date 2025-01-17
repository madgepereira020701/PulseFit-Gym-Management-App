import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import { FaBars } from 'react-icons/fa6';
import { FaAngleDown } from 'react-icons/fa';
import { FaHeartbeat } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [user, setUser] = useState('');
  const [role, setRole] = useState(''); // Track user role

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const storedUserRole = localStorage.getItem('role'); // Retrieve role from localStorage
  
    if (storedUserName) {
      setUser(storedUserName);
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

  const logout = () => {
    localStorage.removeItem('token'); // Remove token on logout
    localStorage.removeItem('userName'); // Remove user data on logout
    localStorage.removeItem('role'); // Remove role data on logout
    window.location.href = '/'; // Redirect to login page
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
      <li><NavLink to="/home" activeClassName="active">Home</NavLink></li>
      <li><NavLink to="/attendance" activeClassName="active">Attendance</NavLink></li>
      <li><NavLink to="/members" activeClassName="active">Add Members</NavLink></li>
      <li><NavLink to="/viewmembers" activeClassName="active">Members</NavLink></li>
      <li><NavLink to="/employees" activeClassName="active">Add Employees</NavLink></li>
      <li><NavLink to="/viewemployees" activeClassName="active">Employees</NavLink></li>
      <li><NavLink to="/addplans" activeClassName="active">Package</NavLink></li>
      <li><NavLink to="/calendar" activeClassName="active">Calendar</NavLink></li>
      <li><NavLink to="/settings" activeClassName="active">Settings</NavLink></li>

    </>
  ) : role === 'Member' ? (
    <>
      <li><NavLink to="/home" activeClassName="active">Home</NavLink></li>
      <li><NavLink to="/details" activeClassName="active">Details</NavLink></li>
      <li><NavLink to="/mcheck" activeClassName="active">Mark Attendance</NavLink></li>
      <li><NavLink to="/memberattendance" activeClassName="active">Attendance</NavLink></li>
      <li><NavLink to="/viewpayments" activeClassName="active">View Payments</NavLink></li>
      <li><NavLink to="/memcalendar" activeClassName="active">Calendar</NavLink></li>
    </>
  ) : role === 'Employee' ? (
    <>
      <li><NavLink to="/home" activeClassName="active">Home</NavLink></li>
      <li><NavLink to="/employeedetails" activeClassName="active">Details</NavLink></li>
      <li><NavLink to="/echeck" activeClassName="active">Mark Attendance</NavLink></li>
      <li><NavLink to="/emcalendar" activeClassName="active">Calendar</NavLink></li>
    </>
  ) : null}
        
        <li className="account" onClick={toggleDropDown}>
          {user ? user : 'Guest'} <FaAngleDown />
          {isDropDownOpen && (
            <ul className="dropdown">
              <li><NavLink onClick={logout} activeClassName="active">Log out</NavLink></li>
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

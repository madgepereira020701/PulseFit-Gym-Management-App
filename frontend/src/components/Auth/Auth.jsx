import React, { useState } from 'react';
import { API } from '../service/api';
import { Navigate } from 'react-router-dom';
import './Auth.css';

const registerInitialValues = {
  name: '',
  email: '',
  password: '',
  role: ''
};

const loginInitialValues = {
  email: '',
  password: '',
  role: ''
};

const Auth = ({ setIsAuthenticated, setUserName }) => {
  const [register, setRegister] = useState(registerInitialValues);
  const [login, setLogin] = useState(loginInitialValues);
  const [account, toggleAccount] = useState('login');
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [redirectToHome, setRedirectToHome] = useState(false);

  const toggleSignup = () => {
    toggleAccount(account === 'register' ? 'login' : 'register');
    setError('');
    setWarnings({});
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) => password.length >= 6;

  const onInputChange = (e) => {
    setRegister({ ...register, [e.target.name]: e.target.value });
    validateFields('register', e.target.name, e.target.value);
  };

  const onValueChange = (e) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
    validateFields('login', e.target.name, e.target.value);
  };

  const onRoleChange = (e) => {
    const role = e.target.value;
    if (account === 'login') {
      setLogin({ ...login, role });
    } else {
      setRegister({ ...register, role });
    }
  };

  const validateFields = (form, field, value) => {
    const newWarnings = { ...warnings };

    if (field === 'email' && !validateEmail(value)) {
      newWarnings.email = 'Please enter a valid email address.';
    } else if (field === 'password' && !validatePassword(value)) {
      newWarnings.password = 'Password must be at least 6 characters long.';
    } else {
      delete newWarnings[field];
    }

    if (form === 'register' && field === 'name' && value.trim() === '') {
      newWarnings.name = 'Name is required.';
    } else if (form === 'register' && field === 'name') {
      delete newWarnings.name;
    }

    setWarnings(newWarnings);
  };

  const registerUser = async () => {
    if (!register.name || !register.email || !register.password || !register.role) {
      setError('Please fill in all fields.');
      return;
    }
    if (Object.keys(warnings).length > 0) {
      setError('Please resolve all validation warnings.');
      return;
    }

    try {
      const response =
        register.role === 'Admin'
          ? await API.userRegister(register) // Admin registration
          : register.role === 'Member'
          ? await API.memberRegister(register) // Member registration
          : register.role === 'Employee'
          ? await API.employeeRegister(register) // Employee registration
          : { isSuccess: false, msg: 'Invalid role' };
    
      if (response.isSuccess) {
        setRegister(registerInitialValues);
        toggleAccount('login');
        setError('');
      } else {
        setError('Something went wrong, try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Error in registerUser:', err);
    }
  };

  const loginUser = async () => {
    if (!login.email || !login.password || !login.role) {
      setError('Please fill in all fields.');
      return;
    }
    if (Object.keys(warnings).length > 0) {
      setError('Please resolve all validation warnings.');
      return;
    }

    try {
      const response =
        login.role === 'Admin'
          ? await API.userLogin(login) // Admin login
          : login.role === 'Member'
          ? await API.memberLogin(login) // Member login
          : login.role === 'Employee'
          ? await API.employeeLogin(login) // Employee login
          : { isSuccess: false, msg: 'Invalid role' };

      if (response.isSuccess) {
        setIsAuthenticated(true);
        if (login.role === 'Admin') {
          setUserName(response.data.userName);
          localStorage.setItem('userName', response.data.userName);
          localStorage.setItem('role', login.role);
        } else if (login.role === 'Member') {
          setUserName(response.data.memberDetails.fullname);
          localStorage.setItem('userName', response.data.memberDetails.fullname);
          localStorage.setItem('role', login.role);
        } else if (login.role === 'Employee') {
          setUserName(response.data.employeeDetails.fullname);
          localStorage.setItem('userName', response.data.employeeDetails.fullname);
          localStorage.setItem('role', login.role);
        }

        localStorage.setItem('token', response.data.token);
        setRedirectToHome(true);
      } else {
        setError('Invalid credentials, please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Error in loginUser:', err);
    }
  }

  if (redirectToHome) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-container">
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      {account === 'login' ? (
        <div className="form-container login">
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Enter Email"
            name="email"
            onChange={onValueChange}
            className="input-field"
          />
          {warnings.email && <p className="warning-message">{warnings.email}</p>}
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              name="password"
              onChange={onValueChange}
              className="input-field"
            />
            <span className="material-icons show-hide" onClick={togglePasswordVisibility}>
              {showPassword ? 'visibility' : 'visibility_off'}
            </span>
          </div>
          <select name="role" value={login.role} onChange={onRoleChange} className="input-field">
            <option value="">Login as</option>
            <option value="Admin">Admin</option>
            <option value="Employee">Employee</option>
            <option value="Member">Member</option>
          </select>
          {warnings.password && <p className="warning-message">{warnings.password}</p>}
          {error && <p className="error-message">{error}</p>}
          <button className="dark-button" onClick={loginUser}>
            Login
          </button>
          <p className="text">OR</p><br />
          <button className="light-button" onClick={toggleSignup}>
            Create an account
          </button>
        </div>
      ) : (
        <div className="form-container register">
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Enter Name"
            name="name"
            onChange={onInputChange}
            className="input-field"
          />
          {warnings.name && <p className="warning-message">{warnings.name}</p>}
          <input
            type="text"
            placeholder="Enter Email"
            name="email"
            onChange={onInputChange}
            className="input-field"
          />
          {warnings.email && <p className="warning-message">{warnings.email}</p>}
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              name="password"
              onChange={onInputChange}
              className="input-field"
            />
            <span className="material-icons show-hide" onClick={togglePasswordVisibility}>
              {showPassword ? "visibility" : "visibility_off"}
            </span>
          </div>

          <select name="role" value={register.role} onChange={onRoleChange} className="input-field">
            <option value="">Signup as</option>
            <option value="Admin">Admin</option>
            <option value="Employee">Employee</option>
            <option value="Member">Member</option>
          </select>
          {warnings.password && <p className="warning-message">{warnings.password}</p>}
          {error && <p className="error-message">{error}</p>}
          <button className="dark-button" onClick={registerUser}>Signup</button>
          <p className="text">OR</p>
          <br />
          <button className="light-button" onClick={toggleSignup}>Already have an account</button>
        </div>
      )}
    </div>
  );
};

export default Auth;

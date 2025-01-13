import React, { useState } from 'react';
import './App.css';
import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/NavBar';
import Home from './components/Home/Home'; // Import Home component
import AddPackage from './components/Plan/AddPlan/AddPackage';
import AddMember from './components/Member/AddMember/AddMember';
import AddEmployee from './components/Employee/AddEmployee/AddEmployee.jsx';
import Members from './components/Member/Members/Members';
import Employees from './components/Employee/Employees/Employees.jsx';
import Settings from './components/Settings/Settings';
import AddRenewal from './components/Renewal/AddRenewal/AddRenewal';
import Renewals from './components/Renewal/Renewals/Renewals';
import Auth from './components/Auth/Auth';
import MemRecords from './components/Member/MemRecords/MemRecords';
import Calendar from './components/Calendar/Calendar';
import EmCalendar  from './components/EmCalendar/EmCalendar.jsx';
import MemCalendar from './components/MemCalendar/MemCalendar';
import YearCalendar from './components/Year Calendar/Year Calendar';
import Details from './components/Details /Details';
import EmployeeDetails from './components/EmployeeDetails/EmployeeDetails';
import ViewPayments from './components/ViewPayments/ViewPayments';
import ProtectedRoute from './ProtectedRoute.jsx';





function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('token') !== null);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');


  return (
    <div className="App">
      <BrowserRouter>
        {isAuthenticated && (
          <Navbar
            isAuthenticated={isAuthenticated}
            userName={userName}
            setIsAuthenticated={setIsAuthenticated}
          />
        )}
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/home" />
              ) : (
                <Auth
                  setIsAuthenticated={setIsAuthenticated}
                  setUserName={setUserName}
                />
              )
            }
          />

          {/* Make '/home' accessible to all roles */}
          <Route path="/home" element={<Home />} />

          {/* Use ProtectedRoute for role-specific pages */}
          <Route path="/members" element={<ProtectedRoute element={<AddMember />} requiredRole="Admin" />} />
          <Route path="/employees" element={<ProtectedRoute element={<AddEmployee />} requiredRole="Admin" />} />
          <Route path="/viewmembers" element={<ProtectedRoute element={<Members />} requiredRole="Admin" />} />
          <Route path="/viewemployees" element={<ProtectedRoute element={<Employees />} requiredRole="Admin" />} />
          <Route path="/addplans" element={<ProtectedRoute element={<AddPackage />} requiredRole="Admin" />} />
          <Route path="/addrenewals/:memno" element={<ProtectedRoute element={<AddRenewal />} requiredRole="Admin" />} />
          <Route path="/viewrenewals" element={<ProtectedRoute element={<Renewals />} requiredRole="Admin" />} />
          <Route path="/payments/:memno" element={<ProtectedRoute element={<MemRecords />} requiredRole="Admin" />} />
          <Route path="/calendar" element={<ProtectedRoute element={<Calendar />} requiredRole="Admin" />} />
          <Route path="/emcalendar" element={<ProtectedRoute element={<EmCalendar />} requiredRole="Employee" />} />
          <Route path="/memcalendar" element={<ProtectedRoute element={<MemCalendar />} requiredRole="Member" />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} requiredRole="Admin" />} />
          <Route path="/year" element={<ProtectedRoute element={<YearCalendar />} requiredRole="Admin" />} />
          <Route path="/details" element={<ProtectedRoute element={<Details />} requiredRole="Member" />} />
          <Route path="/employeedetails" element={<ProtectedRoute element={<EmployeeDetails />} requiredRole="Employee" />} />
          <Route path="/viewpayments" element={<ProtectedRoute element={<ViewPayments />} requiredRole="Member" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}


export default App;

import React, { useState } from 'react';
import './App.css';
import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/NavBar';
import Home from './components/Home/Home'; // Import Home component
import AddPackage from './components/Admin/Plan/AddPlan/AddPackage.jsx';
import AddMember from './components/Admin/Member/AddMember/AddMember.jsx';
import AddEmployee from './components/Admin/Employee/AddEmployee/AddEmployee.jsx';
import Members from './components/Admin/Member/Members/Members.jsx';
import Employees from './components/Admin/Employee/Employees/Employees.jsx';
import Settings from './components/Admin/Settings/Settings.jsx';
import AddRenewal from './components/Admin/Renewal/AddRenewal/AddRenewal.jsx';
import Renewals from './components/Admin/Renewal/Renewals/Renewals.jsx';
import Auth from './components/Auth/Auth';
import ChangePassword from './components/Auth/ChangePassword/ChangePassword.jsx';
import MemRecords from './components/Admin/Member/MemRecords/MemRecords.jsx';
import Calendar from './components/Admin/Calendar/Calendar.jsx';
import EmCalendar  from './components/Employee/EmCalendar/EmCalendar.jsx';
import MemCalendar from './components/Members/MemCalendar/MemCalendar.jsx';
import YearCalendar from './components/Year Calendar/Year Calendar';
import Details from './components/Members/Details /Details.jsx';
import MarkAttendance from './components/MarkAttendance/MarkAttendance.jsx';
import Attendance from './components/Admin/Attendance/Attendance.jsx';
import MAttendance from './components/Members/MAttendance/MAttendance.jsx';
import EAttendance from './components/Employee/EAttendance/EAttendance.jsx';
import EmployeeDetails from './components/Employee/EmployeeDetails/EmployeeDetails.jsx';
import ViewPayments from './components/Members/ViewPayments/ViewPayments.jsx';
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
          <Route path="/year" element={<YearCalendar />} />
          <Route path="/changepassword" element={<ChangePassword />} />


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
          <Route path="/check" element={<ProtectedRoute element={<MarkAttendance />} requiredRoles={['Member', 'Employee']} />} />
          <Route path="/memcalendar" element={<ProtectedRoute element={<MemCalendar />} requiredRole="Member" />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} requiredRole="Admin" />} />
          <Route path="/details" element={<ProtectedRoute element={<Details />} requiredRole="Member" />} />
          <Route path="/employeedetails" element={<ProtectedRoute element={<EmployeeDetails />} requiredRole="Employee" />} />
          <Route path="/viewpayments" element={<ProtectedRoute element={<ViewPayments />} requiredRole="Member" />} />
          <Route path="/memberattendance" element={<ProtectedRoute element={<MAttendance />} requiredRole="Member" />} />
          <Route path="/employeeattendance" element={<ProtectedRoute element={<EAttendance />} requiredRole="Employee"/>}/>
          <Route path="/attendance" element={<ProtectedRoute element={<Attendance />} requiredRole="Admin" />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}


export default App;

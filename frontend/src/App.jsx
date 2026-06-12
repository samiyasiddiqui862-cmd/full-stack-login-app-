import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import Dashboard from './Dashboard.jsx'
import EmployeeForm from './EmployeeForm.jsx'
import EmployeeList from './EmployeeList.jsx'
import Departments from './Departments.jsx'
import Skills from './Skills.jsx'
import LeaveApply from './LeaveApply.jsx'
import MyLeaves from './MyLeaves.jsx'
import AllLeaves from './AllLeaves.jsx'
import AuditLogs from './AuditLogs.jsx'
import Assets from './Assets.jsx'
import Attendance from './Attendance.jsx'
import Reports from './Reports.jsx'
import Salary from './Salary.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/add" element={<EmployeeForm />} />
        <Route path="/employees/edit/:id" element={<EmployeeForm />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/leave-apply" element={<LeaveApply />} />
        <Route path="/my-leaves" element={<MyLeaves />} />
        <Route path="/all-leaves" element={<AllLeaves />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/salary" element={<Salary />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
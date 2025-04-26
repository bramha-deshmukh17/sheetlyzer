import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "./Utility/Theme";
import ErrorBoundary from "./ErrorBoundary";
import Welcome from "./Welcome";
import Dashboard from './User/Dashboard'
import Login from './Admin/Login'
import AdminDashboard from './Admin/Dashboard';
import PageNotFound from './Utility/PageNotFound';
function App() {

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/user/dashboard" element={<Dashboard />} />

            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>

  );
}

export default App

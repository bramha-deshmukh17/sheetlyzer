import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./Utility/Theme";
import ErrorBoundary from "./ErrorBoundary";
import Welcome from "./Welcome";
import Dashboard from './User/Dashboard'
import Login from './Admin/Login'
import AdminDashboard from './Admin/Dashboard';
import PageNotFound from './Utility/PageNotFound';
import ProtectedRoute from './Utility/Protected';
import SheetAnalysis from './User/FileAnalysis';
import FileHistory from "./User/FileHistory";
import GraphSelector from "./User/GraphSelector";
import Admin from "./Admin/Admin";
import ManageUser from "./Admin/User";
import UserFiles from "./Admin/UserFiles";

function App() {

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/user/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/user/file/analysis" element={<ProtectedRoute><SheetAnalysis /></ProtectedRoute>} />
            <Route path="/user/file/history" element={<ProtectedRoute><FileHistory /></ProtectedRoute>} />
            <Route path="/user/graph/view" element={<ProtectedRoute><GraphSelector /></ProtectedRoute>} />

            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute admin={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/view/admin" element={<ProtectedRoute admin={true}><Admin /></ProtectedRoute>} />
            <Route path="/admin/view/user" element={<ProtectedRoute admin={true}><ManageUser /></ProtectedRoute>} />
            <Route path="/admin/user/:userId/files" element={<ProtectedRoute admin={true}><UserFiles /></ProtectedRoute>} />

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>

  );
}

export default App

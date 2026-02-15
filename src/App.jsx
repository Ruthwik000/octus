import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectWorkspace from './pages/ProjectWorkspace';
import AIAnalysis from './pages/AIAnalysis';
import GitHubCallback from './pages/GitHubCallback';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:projectId"
            element={
              <ProtectedRoute>
                <ProjectWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:projectId/ai-analysis"
            element={
              <ProtectedRoute>
                <AIAnalysis />
              </ProtectedRoute>
            }
          />
          <Route path="/auth/github/callback" element={<GitHubCallback />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

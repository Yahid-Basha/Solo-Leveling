import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { QuestProvider } from "./context/QuestContext";

// Pages
import LoginPage from "./pages/LoginPage";
import QuarterSetupPage from "./pages/QuarterSetupPage";
import DashboardPage from "./pages/DashboardPage";
import AddTaskPage from "./pages/AddTaskPage";
import QuestsPage from "./pages/QuestsPage";
import ScoreboardPage from "./pages/ScoreboardPage";

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="w-12 h-12 border-t-4 border-b-4 border-[#0071e3] rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/quarter-setup"
        element={
          <ProtectedRoute>
            <QuestProvider>
              <QuarterSetupPage />
            </QuestProvider>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <QuestProvider>
              <DashboardPage />
            </QuestProvider>
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-task"
        element={
          <ProtectedRoute>
            <QuestProvider>
              <AddTaskPage />
            </QuestProvider>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quests"
        element={
          <ProtectedRoute>
            <QuestProvider>
              <QuestsPage />
            </QuestProvider>
          </ProtectedRoute>
        }
      />

      <Route
        path="/scoreboard"
        element={
          <ProtectedRoute>
            <QuestProvider>
              <ScoreboardPage />
            </QuestProvider>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

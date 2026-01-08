import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SpeedInsights } from "@vercel/speed-insights/react";
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';

// App Pages
import Dashboard from './pages/Dashboard';
import AddIncome from './pages/AddIncome';
import AddExpense from './pages/AddExpense';
import EggCollection from './pages/EggCollection';
import EditCollection from './pages/EditCollection';
import AdvancedStats from './pages/AdvancedStats';
import CoopsList from './pages/CoopsList';
import CoopDetails from './pages/CoopDetails';
import BreedDetails from './pages/BreedDetails';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Caricamento...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes - No Layout required, or specific auth layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Wrapped in Layout */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/add-income" element={<ProtectedRoute><AddIncome /></ProtectedRoute>} />
          <Route path="/add-expense" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
          <Route path="/edit-income/:id" element={<ProtectedRoute><AddIncome /></ProtectedRoute>} />
          <Route path="/edit-expense/:id" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><AdvancedStats /></ProtectedRoute>} />
          <Route path="/production" element={<ProtectedRoute><EggCollection /></ProtectedRoute>} />
          <Route path="/production/edit/:sessionId" element={<ProtectedRoute><EditCollection /></ProtectedRoute>} />

          {/* Protected Routes V3.0 - Pollai */}
          <Route path="/coops" element={<ProtectedRoute><CoopsList /></ProtectedRoute>} />
          <Route path="/coops/:id" element={<ProtectedRoute><CoopDetails /></ProtectedRoute>} />
          <Route path="/breed/:id" element={<ProtectedRoute><BreedDetails /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        </Routes>
        <SpeedInsights />
      </AuthProvider>
    </Router>
  );
}

export default App;

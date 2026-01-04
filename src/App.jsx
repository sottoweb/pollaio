import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddIncome from './pages/AddIncome';
import AddExpense from './pages/AddExpense';
import AdvancedStats from './pages/AdvancedStats';
import CoopsList from './pages/CoopsList';
import CoopDetails from './pages/CoopDetails';
import BreedDetails from './pages/BreedDetails';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-income" element={<AddIncome />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/edit-income/:id" element={<AddIncome />} />
          <Route path="/edit-expense/:id" element={<AddExpense />} />
          <Route path="/stats" element={<AdvancedStats />} />

          {/* Routes V3.0 - Pollai */}
          <Route path="/coops" element={<CoopsList />} />
          <Route path="/coops/:id" element={<CoopDetails />} />
          <Route path="/breed/:id" element={<BreedDetails />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

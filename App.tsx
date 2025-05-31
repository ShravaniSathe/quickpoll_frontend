import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './src/pages/Home';
import ParticipantPage from './src/pages/ParticipantPage';
import CreatePoll from './src/pages/CreatePoll';
import Poll from './src/pages/myPoll';
// import Results from './pages/Results';
// import Login from './pages/Admin/Login';
// import Dashboard from './pages/Admin/Dashboard';
// import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/participant" element={<ParticipantPage />} />
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/mypolls" element={<Poll />} />
        {/* <Route path="/poll/:id" element={<Poll />} />
        <Route path="/poll/:id/results" element={<Results />} />
        <Route path="/admin/login" element={<Login />} /> */}
        {/* <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

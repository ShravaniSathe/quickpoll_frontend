import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './src/pages/Home';
import ParticipantPage from './src/pages/ParticipantPage';
import CreatePoll from './src/pages/CreatePoll';
import Poll from './src/pages/myPoll';
import Login from './src/pages/Admin/Login';
import Dashboard from './src/pages/Admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/participant" element={<ParticipantPage />} />
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/mypolls" element={<Poll />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

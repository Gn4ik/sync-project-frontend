import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import React from 'react';
import Login from "../login/Login";
import MainPage from '../MainPage/MainPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path='/' element={<MainPage />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import BeanList from './components/BeanList';
import BeanProfile from './components/BeanProfile';
import BrewForm from './components/BrewForm';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-coffee-50">
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/beans" element={<BeanList />} />
            <Route path="/bean/:id" element={<BeanProfile />} />
            <Route path="/brew/:beanId" element={<BrewForm />} />
          </Routes>
          <Navigation />
        </div>
      </div>
    </Router>
  );
}

export default App;

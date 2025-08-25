import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation.jsx';
import Home from './components/Home.jsx';
import BeanList from './components/BeanList.jsx';
import BeanProfile from './components/BeanProfile.jsx';
import BrewForm from './components/BrewForm.jsx';
import Onboarding from './components/Onboarding.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import { getOnboardingStatus, setOnboardingStatus, flushPendingBrews } from './utils/storage';
import { useOnlineStatus } from './utils/network';
import './index.css';

const AppWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const status = getOnboardingStatus();
    const params = new URLSearchParams(location.search);
    const inOnboardingFlow = params.get('onboarding') === 'true';

    if (status === 'not-started' && location.pathname !== '/onboarding' && !inOnboardingFlow) {
      navigate('/onboarding');
    }
  }, [location, navigate]);

  // Handle online re-sync
  useEffect(() => {
    if (isOnline) {
      const syncPendingBrews = async () => {
        try {
          const synced = flushPendingBrews();
          if (synced.length > 0) {
            console.info(`Synced ${synced.length} pending brews`);
          }
        } catch (error) {
          console.error('Error syncing pending brews:', error);
        }
      };
      
      // Small delay to ensure connection is stable
      const timeoutId = setTimeout(syncPendingBrews, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isOnline]);

  return (
    <div className="min-h-screen bg-coffee-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <OfflineBanner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/beans" element={<BeanList />} />
          <Route path="/bean/:id" element={<BeanProfile />} />
          <Route path="/brew/new" element={<BrewForm />} />
          <Route path="/brew/:beanId" element={<BrewForm />} />
        </Routes>
        {getOnboardingStatus() !== 'not-started' && <Navigation />}
      </div>
    </div>
  );
};


function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;

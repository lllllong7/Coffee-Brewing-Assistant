import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBeans, setOnboardingStatus } from '../utils/storage';
import BrewForm from './BrewForm';

const Onboarding = () => {
  const navigate = useNavigate();
  const [beans, setBeans] = useState(getBeans());

  const handleSkip = () => {
    setOnboardingStatus('skipped');
    navigate('/');
  };

  const handleBrewLogged = () => {
    setOnboardingStatus('completed');
    navigate('/');
  };

  if (beans.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center text-center h-screen justify-center bg-cream-100">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-3xl font-bold text-coffee-900 mb-2">Welcome to the Coffee Assistant!</h1>
        <p className="text-coffee-600 mb-8 max-w-xs">Let’s get you set up by adding your first coffee bean.</p>
        <button onClick={() => navigate('/beans?add=true&onboarding=true')} className="btn-primary w-full max-w-xs">
            + Add Your First Bean
        </button>
        <button onClick={handleSkip} className="mt-4 text-sm text-coffee-600 hover:text-coffee-800">
            Skip for now
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* The BrewForm component now includes its own header and skip functionality */}
      <BrewForm beanId={beans[0].id} onSave={handleBrewLogged} />
    </div>
  );
};

export default Onboarding;

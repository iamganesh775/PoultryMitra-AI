import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Advisory from './pages/Advisory';
import DiseaseScanner from './pages/DiseaseScanner';
import BreedRecommendation from './pages/BreedRecommendation';
import BusinessPlanner from './pages/BusinessPlanner';
import InvoiceManager from './pages/InvoiceManager';
import HealthScheduler from './pages/HealthScheduler';
import VoiceAdvisory from './pages/VoiceAdvisory';
import Predictions from './pages/Predictions';
import { usePWA } from './hooks/usePWA';

function App() {
  const { isInstallable, installPWA, isOnline } = usePWA();

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>
          {!isOnline && (
            <div className="bg-yellow-500 text-white px-4 py-2 text-center">
              You are offline. Some features may be limited.
            </div>
          )}
          {isInstallable && (
            <div className="bg-blue-500 text-white px-4 py-2 text-center">
              <button onClick={installPWA} className="underline">
                Install PoultryMitra app for offline access
              </button>
            </div>
          )}
          <Layout user={user} signOut={signOut}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/advisory" element={<Advisory />} />
              <Route path="/voice-advisory" element={<VoiceAdvisory />} />
              <Route path="/disease-scanner" element={<DiseaseScanner />} />
              <Route path="/breed-recommendation" element={<BreedRecommendation />} />
              <Route path="/business-planner" element={<BusinessPlanner />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/invoices" element={<InvoiceManager />} />
              <Route path="/health-scheduler" element={<HealthScheduler />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}

export default App;

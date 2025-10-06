import { useState } from 'react';
import LandingPage from './LandingPage';
import IncidentSearchPage from './IncidentSearchPage';
import IncidentWizard from './IncidentWizard';

type AppMode = 'landing' | 'search' | 'report';

export default function IncidentManager() {
  const [currentMode, setCurrentMode] = useState<AppMode>('landing');

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const renderCurrentView = () => {
    switch (currentMode) {
      case 'landing':
        return (
          <LandingPage
            onReportIncident={() => handleModeChange('report')}
            onSearchIncident={() => handleModeChange('search')}
          />
        );
      case 'search':
        return (
          <IncidentSearchPage
            onBack={() => handleModeChange('landing')}
          />
        );
      case 'report':
        return <IncidentWizard onBackToHome={() => handleModeChange('landing')} />;
      default:
        return null;
    }
  };

  return renderCurrentView();
}
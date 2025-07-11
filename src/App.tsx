import React from 'react';
import { NutritionProvider } from './context/NutritionContext';
import RacePlanBuilder from './components/RacePlanBuilder';

const App: React.FC = () => {
  return (
    <NutritionProvider>
      <RacePlanBuilder />
    </NutritionProvider>
  );
};

export default App; 
import React from 'react';
import { NutritionProvider } from './context/NutritionContext';
import RacePlanBuilder from './components/RacePlanBuilder';

function App() {
  return (
    <NutritionProvider>
      <RacePlanBuilder />
    </NutritionProvider>
  );
}

export default App; 
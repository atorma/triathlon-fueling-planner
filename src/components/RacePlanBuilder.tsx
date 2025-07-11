import React from 'react';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import IntakePlan from './IntakePlan';
import RaceStages from './RaceStages';

const RacePlanBuilder: React.FC = () => {
  return (
    <div>
      <h1>Race Plan Builder</h1>
      <RaceStages />
      <section>
        <h2>Nutrition Products</h2>
        <ProductForm />
        <ProductList />
      </section>
      <IntakePlan />
    </div>
  );
};

export default RacePlanBuilder; 
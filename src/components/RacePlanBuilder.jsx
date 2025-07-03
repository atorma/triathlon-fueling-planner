import React from 'react';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import IntakePlan from './IntakePlan';
import RaceStages from './RaceStages';

export default function RacePlanBuilder() {
  return (
    <div>
      <h1>Triathlon Nutrition Planner</h1>
      <RaceStages />
      <section>
        <h2>Nutrition Products</h2>
        <ProductForm />
        <ProductList />
      </section>
      <IntakePlan />
    </div>
  );
} 
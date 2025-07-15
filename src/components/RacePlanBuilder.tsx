import React from 'react';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import IntakePlan from './IntakePlan';
import { Separator } from '@/components/ui/separator';

const RacePlanBuilder: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">Triathlon Fueling Planner</h1>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Fueling Strategy</h2>
            </div>
            <IntakePlan />
          </div>

          <Separator />

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Nutrition Products</h2>
            </div>
            <ProductForm />
            <ProductList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RacePlanBuilder;

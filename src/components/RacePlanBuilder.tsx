import React from 'react';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import IntakePlan from './IntakePlan';
import RaceStages from './RaceStages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const RacePlanBuilder: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">Triathlon Nutrition Planner</h1>
          <p className="text-muted-foreground text-center">Plan your nutrition strategy for optimal performance</p>
        </div>

        <div className="space-y-8">
          {/* Race Stages Section */}
          <Card>
            <CardHeader>
              <CardTitle>Race Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <RaceStages />
            </CardContent>
          </Card>

          <Separator />

          {/* Nutrition Products Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Nutrition Products</h2>
              <p className="text-muted-foreground">Add and manage your nutrition products</p>
            </div>

            <ProductForm />
            <ProductList />
          </div>

          <Separator />

          {/* Intake Plan Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Nutrition Strategy</h2>
              <p className="text-muted-foreground">Plan your nutrition intake for each stage</p>
            </div>

            <IntakePlan />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RacePlanBuilder;

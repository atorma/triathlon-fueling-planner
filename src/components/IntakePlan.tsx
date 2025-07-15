import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import RaceLeg from './RaceLeg';
import { Assignment, Product, Stage } from '../types/nutrition';

function computeRaceTotals(
  assignments: Record<string, Assignment[]>,
  products: Product[],
  stages: Stage[]
): {
  totalCarbs: number;
  totalSalt: number;
  totalFluid: number;
  rateCarbs: number;
  rateSalt: number;
  rateFluid: number;
  totalMinutes: number;
} {
  let totalCarbs = 0;
  let totalSalt = 0;
  let totalFluid = 0;
  let totalMinutes = 0;
  stages.forEach((stage: Stage) => {
    const assigned = assignments[stage.id.toString()] || [];
    let stageCarbs = 0,
      stageSalt = 0,
      stageFluid = 0;
    assigned.forEach(({ productId, quantity }: { productId: number; quantity: number }) => {
      const product = products.find((p: Product) => p.id === productId);
      if (!product) return;
      stageCarbs += product.carbs * quantity;
      stageSalt += product.salt * quantity;
      if (product.unit === 'liters') {
        stageFluid += quantity;
      }
    });
    totalCarbs += stageCarbs;
    totalSalt += stageSalt;
    totalFluid += stageFluid;
    totalMinutes += stage.duration || 0;
  });
  const rateCarbs = totalMinutes ? totalCarbs / (totalMinutes / 60) : 0;
  const rateSalt = totalMinutes ? totalSalt / (totalMinutes / 60) : 0;
  const rateFluid = totalMinutes ? totalFluid / (totalMinutes / 60) : 0;
  return {
    totalCarbs,
    totalSalt,
    totalFluid,
    rateCarbs,
    rateSalt,
    rateFluid,
    totalMinutes,
  };
}

const IntakePlan: React.FC = () => {
  const { state } = useNutrition();
  const allStages = state.stages;
  const raceTotals = computeRaceTotals(state.assignments, state.products, state.stages);

  return (
    <div className="space-y-6">
      {allStages.map(stage => (
        <RaceLeg key={stage.id} stage={stage} />
      ))}

      <Separator />

      <Card className="bg-secondary/20">
        <CardHeader>
          <CardTitle>Race Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="font-medium">Race Duration</div>
              <div className="text-sm">
                {Math.floor(raceTotals.totalMinutes / 60)}h {raceTotals.totalMinutes % 60}m
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Per Hour (Average)</div>
              <div className="text-sm space-y-1">
                <div>Carbs: {raceTotals.rateCarbs.toFixed(1)} g/h</div>
                <div>Salt: {raceTotals.rateSalt.toFixed(1)} g/h</div>
                <div>Fluid: {raceTotals.rateFluid.toFixed(1)} L/h</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Total Intake</div>
              <div className="text-sm space-y-1">
                <div>Carbs: {raceTotals.totalCarbs.toFixed(1)} g</div>
                <div>Salt: {raceTotals.totalSalt.toFixed(1)} g</div>
                <div>Fluid: {raceTotals.totalFluid.toFixed(1)} L</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntakePlan;

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
  const raceHours = Math.floor(raceTotals.totalMinutes / 60);
  const raceMinutes = raceTotals.totalMinutes % 60;
  const raceDuration = `${raceHours}h ${raceMinutes}m`;

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
          {/* Desktop */}
          <div className="hidden md:block mb-4">
            <div className="font-medium">Duration</div>
            <div className="text-sm">{raceDuration}</div>
          </div>
          <table className="hidden md:table w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-1 font-medium">Nutrient</th>
                <th className="text-left p-1 font-medium">Intake Rate</th>
                <th className="text-left p-1 font-medium">Total Intake</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1 text-sm">Carbs</td>
                <td className="p-1 text-sm">{raceTotals.rateCarbs.toFixed(1)} g/h</td>
                <td className="p-1 text-sm">{raceTotals.totalCarbs.toFixed(1)} g</td>
              </tr>
              <tr>
                <td className="p-1 text-sm">Salt</td>
                <td className="p-1 text-sm">{raceTotals.rateSalt.toFixed(1)} g/h</td>
                <td className="p-1 text-sm">{raceTotals.totalSalt.toFixed(1)} g</td>
              </tr>
              <tr>
                <td className="p-1 text-sm">Fluid</td>
                <td className="p-1 text-sm">{raceTotals.rateFluid.toFixed(1)} L/h</td>
                <td className="p-1 text-sm">{raceTotals.totalFluid.toFixed(1)} L</td>
              </tr>
            </tbody>
          </table>
          {/* Mobile Stacked */}
          <div className="block md:hidden">
            <div className="mb-2">
              <div className="font-bold">Duration</div>
              <div>{raceDuration}</div>
            </div>
            {[
              {
                name: 'Carbs',
                rate: `${raceTotals.rateCarbs.toFixed(1)} g/h`,
                total: `${raceTotals.totalCarbs.toFixed(1)} g`,
              },
              {
                name: 'Salt',
                rate: `${raceTotals.rateSalt.toFixed(1)} g/h`,
                total: `${raceTotals.totalSalt.toFixed(1)} g`,
              },
              {
                name: 'Fluid',
                rate: `${raceTotals.rateFluid.toFixed(1)} L/h`,
                total: `${raceTotals.totalFluid.toFixed(1)} L`,
              },
            ].map(n => (
              <div key={n.name} className="mb-2">
                <div className="font-bold">{n.name}</div>
                <div>Intake Rate: {n.rate}</div>
                <div>Total: {n.total}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntakePlan;

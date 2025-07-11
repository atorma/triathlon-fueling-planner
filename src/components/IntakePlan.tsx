import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Product, Stage, Assignment } from '../types/nutrition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Totals {
  totalCarbs: number;
  totalSalt: number;
  totalFluid: number;
  rateCarbs: number;
  rateSalt: number;
  rateFluid: number;
}

interface RaceTotals extends Totals {
  totalMinutes: number;
}

function computeTotals(
  assignments: Record<string, Assignment[]>,
  products: Product[],
  stageKey: string | number,
  durationMin: number
): Totals {
  let totalCarbs = 0;
  let totalSalt = 0;
  let totalFluid = 0;
  const assigned = assignments[stageKey.toString()] || [];
  assigned.forEach(({ productId, quantity }) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    totalCarbs += product.carbs * quantity;
    totalSalt += product.salt * quantity;
    if (product.unit === 'liter') {
      totalFluid += quantity;
    }
  });
  const rateCarbs = durationMin ? totalCarbs / (durationMin / 60) : 0;
  const rateSalt = durationMin ? totalSalt / (durationMin / 60) : 0;
  const rateFluid = durationMin ? totalFluid / (durationMin / 60) : 0;
  return {
    totalCarbs,
    totalSalt,
    totalFluid,
    rateCarbs,
    rateSalt,
    rateFluid,
  };
}

function computeRaceTotals(
  assignments: Record<string, Assignment[]>,
  products: Product[],
  stages: Stage[]
): RaceTotals {
  // Sum all stages
  let totalCarbs = 0;
  let totalSalt = 0;
  let totalFluid = 0;
  let totalMinutes = 0;
  stages.forEach(stage => {
    const totals = computeTotals(assignments, products, stage.id, stage.duration || 0);
    totalCarbs += totals.totalCarbs;
    totalSalt += totals.totalSalt;
    totalFluid += totals.totalFluid;
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
  const { state, dispatch } = useNutrition();
  const [selectedProducts, setSelectedProducts] = useState<Record<number, number>>({});

  const handleAmountChange = (stageId: number, productId: number, value: string): void => {
    const quantity = parseFloat(value) || 0;
    dispatch({ type: 'ASSIGN_PRODUCT', stageId, productId, quantity });
  };

  const handleAddProduct = (stageId: number): void => {
    const productId = selectedProducts[stageId];
    if (productId) {
      dispatch({ type: 'ASSIGN_PRODUCT', stageId, productId, quantity: 1 });
      setSelectedProducts(prev => ({ ...prev, [stageId]: 0 }));
    }
  };

  const handleRemoveProduct = (stageId: number, productId: number): void => {
    dispatch({ type: 'ASSIGN_PRODUCT', stageId, productId, quantity: 0 });
  };

  const getAssignments = (stageKey: string | number): Assignment[] => state.assignments[stageKey.toString()] || [];

  const getAvailableProducts = (stageId: number): Product[] => {
    const assignedProductIds = getAssignments(stageId).map(a => a.productId);
    return state.products.filter(p => !assignedProductIds.includes(p.id));
  };

  const assignableStages = state.stages.filter(s => s.name === 'Swim' || s.name === 'Bike' || s.name === 'Run');
  const raceTotals = computeRaceTotals(state.assignments, state.products, state.stages);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Intake Plan</h2>
      {assignableStages.map((stage, idx) => {
        const assignments = getAssignments(stage.id);
        const availableProducts = getAvailableProducts(stage.id);

        return (
          <Card key={stage.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">{stage.name}</Badge>
                {stage.duration && <span className="text-sm text-muted-foreground">({stage.duration} min)</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Product Section */}
              {availableProducts.length > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-3">Add Product</h4>
                    <div className="flex gap-2">
                      <Select
                        value={selectedProducts[stage.id]?.toString() || ''}
                        onValueChange={value =>
                          setSelectedProducts(prev => ({
                            ...prev,
                            [stage.id]: parseInt(value) || 0,
                          }))
                        }
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select a product..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts.map(product => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => handleAddProduct(stage.id)}
                        disabled={!selectedProducts[stage.id]}
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Assigned Products */}
              {assignments.length === 0 ? (
                <div className="text-muted-foreground italic text-center py-4">No products assigned to this stage.</div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Product</th>
                          <th className="text-left p-2 font-medium">Amount</th>
                          <th className="text-left p-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map(assignment => {
                          const product = state.products.find(p => p.id === assignment.productId);
                          if (!product) return null;

                          return (
                            <tr key={assignment.productId} className="border-b">
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{product.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {product.unit}
                                  </Badge>
                                </div>
                              </td>
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={assignment.quantity}
                                    onChange={e => handleAmountChange(stage.id, assignment.productId, e.target.value)}
                                    className="w-20"
                                  />
                                  <span className="text-sm text-muted-foreground">{product.unit}</span>
                                </div>
                              </td>
                              <td className="p-2">
                                <Button
                                  onClick={() => handleRemoveProduct(stage.id, assignment.productId)}
                                  variant="destructive"
                                  size="sm"
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Stage Totals */}
                  {(() => {
                    const totals = computeTotals(state.assignments, state.products, stage.id, stage.duration);
                    return (
                      <Card className="bg-primary/5">
                        <CardContent className="pt-4">
                          <h4 className="font-medium mb-2">Stage Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="font-medium">Total Carbs</div>
                              <div className="text-muted-foreground">{totals.totalCarbs.toFixed(1)} g</div>
                            </div>
                            <div>
                              <div className="font-medium">Total Salt</div>
                              <div className="text-muted-foreground">{totals.totalSalt.toFixed(1)} g</div>
                            </div>
                            <div>
                              <div className="font-medium">Total Fluid</div>
                              <div className="text-muted-foreground">{totals.totalFluid.toFixed(2)} L</div>
                            </div>
                            <div>
                              <div className="font-medium">Per Hour</div>
                              <div className="text-muted-foreground">
                                {totals.rateCarbs.toFixed(1)} g/h carbs, {totals.rateSalt.toFixed(1)} g/h salt,{' '}
                                {totals.rateFluid.toFixed(2)} L/h fluid
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>
              )}

              {/* Intake Summary after the Run leg */}
              {idx === assignableStages.length - 1 && (
                <>
                  <Separator />
                  <Card className="bg-secondary/20">
                    <CardHeader>
                      <CardTitle>Race Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="font-medium">Total Intake</div>
                          <div className="text-sm space-y-1">
                            <div>Carbs: {raceTotals.totalCarbs.toFixed(1)} g</div>
                            <div>Salt: {raceTotals.totalSalt.toFixed(1)} g</div>
                            <div>Fluid: {raceTotals.totalFluid.toFixed(2)} L</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="font-medium">Per Hour (Average)</div>
                          <div className="text-sm space-y-1">
                            <div>Carbs: {raceTotals.rateCarbs.toFixed(1)} g/h</div>
                            <div>Salt: {raceTotals.rateSalt.toFixed(1)} g/h</div>
                            <div>Fluid: {raceTotals.rateFluid.toFixed(2)} L/h</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="font-medium">Race Duration</div>
                          <div className="text-sm">
                            {Math.floor(raceTotals.totalMinutes / 60)}h {raceTotals.totalMinutes % 60}m
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default IntakePlan;

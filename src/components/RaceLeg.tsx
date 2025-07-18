import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Stage } from '../types/nutrition';
import { Separator } from '@/components/ui/separator';

function pad(num: number): string {
  return num.toString().padStart(2, '0');
}

function parseTime(str: string): number {
  const [h, m] = str.includes(':') ? str.split(':') : ['0', str];
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${pad(m)}`;
}

const RaceLeg: React.FC<{ stage: Stage }> = ({ stage }) => {
  const { state, dispatch } = useNutrition();
  const assignments = state.assignments[stage.id.toString()] || [];
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [timeInput, setTimeInput] = useState(() => (stage ? formatTime(stage.duration) : '0:00'));
  const [selectedProduct, setSelectedProduct] = useState<number>(0);

  // Keep local time input in sync if stage changes
  React.useEffect(() => {
    setTimeInput(formatTime(stage.duration));
  }, [stage.duration]);

  const handleTimeChange = (value: string) => {
    setTimeInput(value);
    const valid = /^\d{1,2}(:\d{1,2})?$/.test(value);
    if (valid) {
      let mins = 0;
      try {
        mins = parseTime(value);
      } catch {
        mins = 0;
      }
      dispatch({ type: 'UPDATE_STAGE', stage: { ...stage, duration: mins } });
    }
  };

  const handleTimeBlur = (value: string) => {
    const valid = /^\d{1,2}(:\d{1,2})?$/.test(value);
    if (!valid) {
      setTimeInput(formatTime(stage.duration));
    }
  };

  const handleAmountChange = (productId: number, value: string) => {
    setInputValues(prev => ({ ...prev, [productId]: value }));
    const quantity = parseFloat(value);
    if (!isNaN(quantity)) {
      dispatch({ type: 'UPDATE_PRODUCT_QUANTITY', stageId: stage.id, productId, quantity });
    }
  };

  const handleRemoveProduct = (productId: number) => {
    dispatch({ type: 'REMOVE_PRODUCT', stageId: stage.id, productId });
  };

  const handleAddProduct = (productId: number) => {
    dispatch({ type: 'ASSIGN_PRODUCT', stageId: stage.id, productId, quantity: 0 });
    setSelectedProduct(0);
  };

  const assignedProductIds = assignments.map(a => a.productId);
  const availableProducts = state.products.filter(p => !assignedProductIds.includes(p.id));

  // Stage totals calculation (copied from IntakePlan)
  let totalCarbs = 0;
  let totalSalt = 0;
  let totalFluid = 0;
  assignments.forEach(({ productId, quantity }) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    totalCarbs += product.carbs * quantity;
    totalSalt += product.salt * quantity;
    if (product.unit === 'liters') {
      totalFluid += quantity;
    }
  });
  const rateCarbs = stage.duration ? totalCarbs / (stage.duration / 60) : 0;
  const rateSalt = stage.duration ? totalSalt / (stage.duration / 60) : 0;
  const rateFluid = stage.duration ? totalFluid / (stage.duration / 60) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h3 className="text-lg">{stage.name}</h3>
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <label htmlFor={`stage-time-${stage.id}`} className="text-base font-medium">
            Time:
          </label>
          <Input
            id={`stage-time-${stage.id}`}
            type="text"
            value={timeInput}
            onChange={e => handleTimeChange(e.target.value)}
            onBlur={e => handleTimeBlur(e.target.value)}
            placeholder="h:mm or mm"
            className="w-24"
            pattern="^\d{0,2}:?\d{0,2}$"
            title="Enter as h:mm or mm"
          />
          <span className="text-xs text-muted-foreground">Format: h:mm (e.g., 1:30) or mm (e.g., 90)</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1 font-medium">Product</th>
                  <th className="text-left p-1 font-medium">Amount</th>
                  <th className="text-left p-1 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assignment => {
                  const product = state.products.find(p => p.id === assignment.productId);
                  if (!product) return null;
                  return (
                    <tr key={assignment.productId}>
                      <td className="p-1 text-sm">{product.name}</td>
                      <td className="p-1">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={inputValues[assignment.productId] ?? assignment.quantity.toString()}
                            onChange={e => handleAmountChange(assignment.productId, e.target.value)}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">{product.unit}</span>
                        </div>
                      </td>
                      <td className="p-1">
                        <Button onClick={() => handleRemoveProduct(assignment.productId)} size="sm">
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {availableProducts.length > 0 && (
                  <tr className="border-t">
                    <td className="p-1 pt-2" colSpan={3}>
                      <div className="flex gap-2 items-center">
                        <Select
                          value={selectedProduct ? selectedProduct.toString() : ''}
                          onValueChange={value => handleAddProduct(parseInt(value))}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Add product..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map(product => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Separator />
        <table className="w-full">
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
              <td className="p-1 text-sm">{rateCarbs.toFixed(1)} g/h</td>
              <td className="p-1 text-sm">{totalCarbs.toFixed(1)} g</td>
            </tr>
            <tr>
              <td className="p-1 text-sm">Salt</td>
              <td className="p-1 text-sm">{rateSalt.toFixed(1)} g/h</td>
              <td className="p-1 text-sm">{totalSalt.toFixed(1)} g</td>
            </tr>
            <tr>
              <td className="p-1 text-sm">Fluid</td>
              <td className="p-1 text-sm">{rateFluid.toFixed(1)} L/h</td>
              <td className="p-1 text-sm">{totalFluid.toFixed(1)} L</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default RaceLeg;

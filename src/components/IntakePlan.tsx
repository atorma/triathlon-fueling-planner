import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Product, Stage, Assignment } from '../types/nutrition';

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
    const product = products.find((p) => p.id === productId);
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
  stages.forEach((stage) => {
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

  const getAssignments = (stageKey: string | number): Assignment[] => 
    state.assignments[stageKey.toString()] || [];

  const getAvailableProducts = (stageId: number): Product[] => {
    const assignedProductIds = getAssignments(stageId).map(a => a.productId);
    return state.products.filter(p => !assignedProductIds.includes(p.id));
  };

  const assignableStages = state.stages.filter(
    (s) => s.name === 'Swim' || s.name === 'Bike' || s.name === 'Run'
  );
  const raceTotals = computeRaceTotals(state.assignments, state.products, state.stages);

  return (
    <section>
      <h2>Intake Plan</h2>
      {assignableStages.map((stage, idx) => {
        const assignments = getAssignments(stage.id);
        const availableProducts = getAvailableProducts(stage.id);
        
        return (
          <div key={stage.id} style={{ marginBottom: 24 }}>
            <h3>{stage.name}</h3>
            
            {/* Add Product Section */}
            {availableProducts.length > 0 && (
              <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                <h4>Add Product</h4>
                <select
                  value={selectedProducts[stage.id] || ''}
                  onChange={(e) => setSelectedProducts(prev => ({ 
                    ...prev, 
                    [stage.id]: parseInt(e.target.value) || 0 
                  }))}
                  style={{ marginRight: 8 }}
                >
                  <option value="">Select a product...</option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAddProduct(stage.id)}
                  disabled={!selectedProducts[stage.id]}
                  style={{ padding: '4px 8px' }}
                >
                  Add
                </button>
              </div>
            )}

            {/* Assigned Products */}
            {assignments.length === 0 ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>
                No products assigned to this stage.
              </div>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment) => {
                      const product = state.products.find((p) => p.id === assignment.productId);
                      if (!product) return null;
                      
                      return (
                        <tr key={assignment.productId}>
                          <td>{product.name}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={assignment.quantity}
                              onChange={(e) =>
                                handleAmountChange(stage.id, assignment.productId, e.target.value)
                              }
                              style={{ width: 80 }}
                            />{' '}
                            <span>{product.unit}</span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleRemoveProduct(stage.id, assignment.productId)}
                              style={{ padding: '2px 6px', fontSize: '12px' }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {/* Stage Totals */}
                {(() => {
                  const totals = computeTotals(
                    state.assignments,
                    state.products,
                    stage.id,
                    stage.duration
                  );
                  return (
                                      <div style={{ marginTop: 8 }}>
                    <strong>Total:</strong> Carbs: {totals.totalCarbs} g, Salt: {totals.totalSalt} g, Fluid: {totals.totalFluid} L
                    <br />
                    <strong>Per hour:</strong> Carbs: {totals.rateCarbs.toFixed(1)} g/h, Salt: {totals.rateSalt.toFixed(1)} g/h, Fluid: {totals.rateFluid.toFixed(2)} L/h
                  </div>
                  );
                })()}
              </>
            )}

            {/* Intake Summary after the Run leg */}
            {idx === assignableStages.length - 1 && (
              <div
                style={{ marginTop: 32, borderTop: '1px solid #ccc', paddingTop: 16 }}
              >
                <h3>Intake Summary (Total for Race)</h3>
                <div>
                  <strong>Total:</strong> Carbs: {raceTotals.totalCarbs} g, Salt: {raceTotals.totalSalt} g, Fluid: {raceTotals.totalFluid} L
                </div>
                <div>
                  <strong>Per hour (whole race):</strong> Carbs: {raceTotals.rateCarbs.toFixed(1)} g/h, Salt: {raceTotals.rateSalt.toFixed(1)} g/h, Fluid: {raceTotals.rateFluid.toFixed(2)} L/h
                </div>
                <div>
                  <strong>Total race time:</strong> {raceTotals.totalMinutes} min
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};

export default IntakePlan; 
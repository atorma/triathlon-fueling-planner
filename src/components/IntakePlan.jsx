import React from 'react';
import { useNutrition } from '../context/NutritionContext';

function computeTotals(assignments, products, stageKey, durationMin) {
  let totalCarbs = 0;
  let totalSodium = 0;
  let totalFluid = 0;
  const assigned = assignments[stageKey] || [];
  assigned.forEach(({ productId, quantity }) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    totalCarbs += product.carbs * quantity;
    totalSodium += product.sodium * quantity;
    if (product.unit === 'liter') {
      totalFluid += quantity;
    }
  });
  const rateCarbs = durationMin ? totalCarbs / (durationMin / 60) : 0;
  const rateSodium = durationMin ? totalSodium / (durationMin / 60) : 0;
  const rateFluid = durationMin ? totalFluid / (durationMin / 60) : 0;
  return {
    totalCarbs,
    totalSodium,
    totalFluid,
    rateCarbs,
    rateSodium,
    rateFluid,
  };
}

function computeRaceTotals(assignments, products, stages) {
  // Sum Swim, Bike, and Run
  const keys = stages.filter(s => s.name === 'Swim' || s.name === 'Bike' || s.name === 'Run').map(s => s.id);
  let totalCarbs = 0;
  let totalSodium = 0;
  let totalFluid = 0;
  keys.forEach(key => {
    const stage = stages.find(s => s.id === key) || {};
    const totals = computeTotals(assignments, products, key, stage.duration || 0);
    totalCarbs += totals.totalCarbs;
    totalSodium += totals.totalSodium;
    totalFluid += totals.totalFluid;
  });
  // Compute total race duration as sum of all race stages
  const raceStageMinutes = stages.reduce((sum, s) => sum + (s.duration || 0), 0);
  const rateCarbs = raceStageMinutes ? totalCarbs / (raceStageMinutes / 60) : 0;
  const rateSodium = raceStageMinutes ? totalSodium / (raceStageMinutes / 60) : 0;
  const rateFluid = raceStageMinutes ? totalFluid / (raceStageMinutes / 60) : 0;
  return {
    totalCarbs,
    totalSodium,
    totalFluid,
    rateCarbs,
    rateSodium,
    rateFluid,
    totalMinutes: raceStageMinutes,
  };
}

export default function IntakePlan() {
  const { state, dispatch } = useNutrition();

  const handleAmountChange = (stageId, productId, value) => {
    const quantity = parseFloat(value) || 0;
    dispatch({ type: 'ASSIGN_PRODUCT', stageId, productId, quantity });
  };

  const getAssignments = (stageKey) => state.assignments[stageKey] || [];

  const assignableStages = state.stages.filter(s => s.name === "Swim" || s.name === 'Bike' || s.name === 'Run');
  const raceTotals = computeRaceTotals(state.assignments, state.products, state.stages);

  return (
    <>
      <section>
        <h2>Intake Plan</h2>
        {assignableStages.map((stage, idx) => (
          <div key={stage.id} style={{ marginBottom: 24 }}>
            <h3>{stage.name}</h3>
            {state.products.length === 0 ? (
              <div>No products available.</div>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.products.map(product => {
                      const assigned = getAssignments(stage.id).find(a => a.productId === product.id);
                      return (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={assigned ? assigned.quantity : ''}
                              onChange={e => handleAmountChange(stage.id, product.id, e.target.value)}
                              style={{ width: 80 }}
                            />{' '}
                            <span>{product.unit}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {(() => {
                  const totals = computeTotals(state.assignments, state.products, stage.id, stage.duration);
                  return (
                    <div style={{ marginTop: 8 }}>
                      <strong>Total:</strong> Carbs: {totals.totalCarbs} g, Sodium: {totals.totalSodium} mg, Fluid: {totals.totalFluid} L<br />
                      <strong>Per hour:</strong> Carbs: {totals.rateCarbs.toFixed(1)} g/h, Sodium: {totals.rateSodium.toFixed(1)} mg/h, Fluid: {totals.rateFluid.toFixed(2)} L/h
                    </div>
                  );
                })()}
                {/* Intake Summary after the Run leg */}
                {idx === assignableStages.length - 1 && (
                  <div style={{ marginTop: 32, borderTop: '1px solid #ccc', paddingTop: 16 }}>
                    <h3>Intake Summary (Total for Race)</h3>
                    <div>
                      <strong>Total:</strong> Carbs: {raceTotals.totalCarbs} g, Sodium: {raceTotals.totalSodium} mg, Fluid: {raceTotals.totalFluid} L
                    </div>
                    <div>
                      <strong>Per hour:</strong> Carbs: {raceTotals.rateCarbs.toFixed(1)} g/h, Sodium: {raceTotals.rateSodium.toFixed(1)} mg/h, Fluid: {raceTotals.rateFluid.toFixed(2)} L/h
                    </div>
                    <div>
                      <strong>Total race time:</strong> {raceTotals.totalMinutes} min
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </section>
    </>
  );
} 
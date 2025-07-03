import React from 'react';
import { useNutrition } from '../context/NutritionContext';

export default function ProductList() {
  const { state, dispatch } = useNutrition();

  const handleChange = (product, field, value) => {
    let updated = { ...product, [field]: value };
    if (field === 'carbs' || field === 'sodium') {
      updated[field] = parseFloat(value) || 0;
    }
    dispatch({ type: 'UPDATE_PRODUCT', product: updated });
  };

  if (!state.products.length) return <div>No products added yet.</div>;
  return (
    <table style={{ marginBottom: 16 }}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Carbs (g/unit)</th>
          <th>Sodium (mg/unit)</th>
          <th>Unit</th>
        </tr>
      </thead>
      <tbody>
        {state.products.map((p) => (
          <tr key={p.id}>
            <td>
              <input
                name="name"
                value={p.name}
                onChange={e => handleChange(p, 'name', e.target.value)}
                style={{ width: 100 }}
              />
            </td>
            <td>
              <input
                name="carbs"
                type="number"
                value={p.carbs}
                onChange={e => handleChange(p, 'carbs', e.target.value)}
                style={{ width: 80 }}
              />
            </td>
            <td>
              <input
                name="sodium"
                type="number"
                value={p.sodium}
                onChange={e => handleChange(p, 'sodium', e.target.value)}
                style={{ width: 80 }}
              />
            </td>
            <td>
              <select
                name="unit"
                value={p.unit}
                onChange={e => handleChange(p, 'unit', e.target.value)}
              >
                <option value="liter">liter</option>
                <option value="item">item</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 
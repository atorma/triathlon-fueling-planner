import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Product } from '../types/nutrition';

const ProductList: React.FC = () => {
  const { state, dispatch } = useNutrition();

  const handleChange = (product: Product, field: keyof Product, value: string | number): void => {
    let updated = { ...product, [field]: value };
    if (field === 'carbs' || field === 'salt') {
      updated[field] = parseFloat(value as string) || 0;
    }
    dispatch({ type: 'UPDATE_PRODUCT', product: updated });
  };

  if (!state.products.length) return <div>No products added yet.</div>;

  return (
    <table style={{ marginBottom: 16 }}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Carbs g/unit</th>
          <th>Salt g/unit</th>
          <th>Unit</th>
        </tr>
      </thead>
      <tbody>
        {state.products.map(p => (
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
                name="salt"
                type="number"
                value={p.salt}
                onChange={e => handleChange(p, 'salt', e.target.value)}
                style={{ width: 80 }}
              />
            </td>
            <td>
              <select
                name="unit"
                value={p.unit}
                onChange={e => handleChange(p, 'unit', e.target.value as 'liter' | 'item')}
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
};

export default ProductList;

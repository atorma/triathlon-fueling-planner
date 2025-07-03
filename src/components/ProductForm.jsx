import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';

const defaultProduct = {
  name: '',
  carbs: '',
  sodium: '',
  unit: 'liter',
};

export default function ProductForm() {
  const { dispatch } = useNutrition();
  const [product, setProduct] = useState(defaultProduct);

  const handleChange = e => {
    const { name, value } = e.target;
    setProduct(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!product.name) return;
    dispatch({
      type: 'ADD_PRODUCT',
      product: {
        ...product,
        id: Date.now(),
        carbs: parseFloat(product.carbs) || 0,
        sodium: parseFloat(product.sodium) || 0,
      },
    });
    setProduct(defaultProduct);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <input
        name="name"
        placeholder="Product name"
        value={product.name}
        onChange={handleChange}
        required
        style={{ marginRight: 8 }}
      />
      <input
        name="carbs"
        placeholder="Carbs (g/unit)"
        type="number"
        value={product.carbs}
        onChange={handleChange}
        min="0"
        step="any"
        style={{ width: 100, marginRight: 8 }}
      />
      <input
        name="sodium"
        placeholder="Sodium (mg/unit)"
        type="number"
        value={product.sodium}
        onChange={handleChange}
        min="0"
        step="any"
        style={{ width: 120, marginRight: 8 }}
      />
      <select name="unit" value={product.unit} onChange={handleChange} style={{ marginRight: 8 }}>
        <option value="liter">liter</option>
        <option value="item">item</option>
      </select>
      <button type="submit">Add Product</button>
    </form>
  );
} 